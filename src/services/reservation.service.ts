import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APP_URL, HOSPITAL_NAME } from "@/lib/config";
import { MAX_ACTIVE_RESERVATIONS, isValidReminderMinutes } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { ServiceError } from "@/lib/errors";
import { dateKeyInTz, dayRangeUtc, formatDayLong, formatDayShort, formatTime } from "@/lib/time";
import { padTicket } from "@/lib/utils";
import { reservationCancelledEmail } from "@/emails/reservation-cancelled";
import { bookingWindow } from "./appointment.service";
import type { Paged, ReservationFilter, ReservationView } from "@/types/reservation.types";

type ReservationRow = Prisma.ReservationGetPayload<{
  include: { appointment: true; user: { select: { id: true; name: true; email: true } } };
}>;

const withRelations = {
  appointment: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ReservationInclude;

export function toReservationView(r: ReservationRow, now: Date = new Date()): ReservationView {
  const state =
    r.status === "CANCELLED" ? "cancelled" : r.appointment.endTime > now ? "upcoming" : "completed";
  return {
    id: r.id,
    ticketNo: padTicket(r.id),
    state,
    slotId: r.appointmentId,
    startsAt: r.appointment.startTime.toISOString(),
    dayShort: formatDayShort(r.appointment.startTime),
    dayLong: formatDayLong(r.appointment.startTime),
    start: formatTime(r.appointment.startTime),
    end: formatTime(r.appointment.endTime),
    reminderLeadMinutes: r.reminderLeadMinutes,
    reminderSent: r.reminderSentAt !== null,
    createdByAdmin: r.createdByAdmin,
    cancelledBy: r.cancelledBy,
    user: r.user,
  };
}

/**
 * "Active" here means a reservation that hasn't been cancelled AND hasn't finished yet.
 * Otherwise a user's old, completed visits would count against their limit forever.
 */
export function countActiveReservations(userId: number, now: Date = new Date()): Promise<number> {
  return prisma.reservation.count({
    where: { userId, status: "ACTIVE", appointment: { endTime: { gt: now } } },
  });
}

// ---- Creating (FR-03, FR-05, FR-08, FR-13) ----

export async function createReservation(input: {
  userId: number;
  appointmentId: number;
  reminderLeadMinutes: number;
  createdByAdmin?: boolean;
}): Promise<ReservationView> {
  const now = new Date();
  const { to } = bookingWindow(now);

  const reservation = await prisma.$transaction(async (tx) => {
    // Lock this user's row so two simultaneous requests can't both slip past the limit.
    await tx.$queryRaw`SELECT user_id FROM users WHERE user_id = ${input.userId} FOR UPDATE`;

    const user = await tx.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new ServiceError("USER_NOT_FOUND", "That account no longer exists.");
    if (!input.createdByAdmin && !user.emailVerified) {
      throw new ServiceError("EMAIL_NOT_VERIFIED", "Please verify your email address before reserving a time.");
    }
    if (!isValidReminderMinutes(input.reminderLeadMinutes)) {
      throw new ServiceError("REMINDER_LOCKED", "Choose one of the listed reminder times.");
    }

    const activeCount = await tx.reservation.count({
      where: { userId: user.id, status: "ACTIVE", appointment: { endTime: { gt: now } } },
    });
    if (activeCount >= MAX_ACTIVE_RESERVATIONS) {
      throw new ServiceError(
        "LIMIT_REACHED",
        input.createdByAdmin
          ? `${user.name} already has ${MAX_ACTIVE_RESERVATIONS} upcoming reservations.`
          : `You already have ${MAX_ACTIVE_RESERVATIONS} upcoming reservations. Cancel one to book another.`,
      );
    }

    // Claim the slot atomically: only one request can flip isReserved from false to true.
    const claimed = await tx.appointment.updateMany({
      where: { id: input.appointmentId, isReserved: false, startTime: { gt: now, lte: to } },
      data: { isReserved: true },
    });
    if (claimed.count !== 1) {
      const slot = await tx.appointment.findUnique({ where: { id: input.appointmentId } });
      if (!slot) throw new ServiceError("SLOT_NOT_FOUND", "That time slot doesn't exist.");
      if (slot.startTime <= now) throw new ServiceError("SLOT_PAST", "That time has already passed.");
      if (slot.startTime > to) throw new ServiceError("OUT_OF_WINDOW", "You can only book up to 30 days ahead.");
      throw new ServiceError("SLOT_TAKEN", "Sorry, someone just reserved that time. Please pick another one.");
    }

    return tx.reservation.create({
      data: {
        userId: user.id,
        appointmentId: input.appointmentId,
        reminderLeadMinutes: input.reminderLeadMinutes,
        createdByAdmin: input.createdByAdmin ?? false,
      },
      include: withRelations,
    });
  });

  return toReservationView(reservation, now);
}

// ---- Cancelling (FR-09, FR-10) ----

export type CancelActor = { type: "user"; userId: number } | { type: "admin" };

export async function cancelReservation(input: {
  reservationId: number;
  actor: CancelActor;
}): Promise<{ reservation: ReservationView; emailSent: boolean | null }> {
  const now = new Date();
  const { reservationId, actor } = input;

  const row = await prisma.$transaction(async (tx) => {
    const r = await tx.reservation.findUnique({ where: { id: reservationId }, include: withRelations });
    // Someone else's reservation looks exactly like one that doesn't exist.
    if (!r || (actor.type === "user" && r.userId !== actor.userId)) {
      throw new ServiceError("RESERVATION_NOT_FOUND", "We couldn't find that reservation.");
    }
    if (r.status !== "ACTIVE") throw new ServiceError("ALREADY_CANCELLED", "This reservation is already cancelled.");
    if (actor.type === "user" && r.appointment.startTime <= now) {
      throw new ServiceError("RESERVATION_PAST", "This appointment has already started, so it can't be cancelled.");
    }

    const updated = await tx.reservation.updateMany({
      where: { id: r.id, status: "ACTIVE" },
      data: { status: "CANCELLED", cancelledAt: now, cancelledBy: actor.type === "admin" ? "ADMIN" : "USER" },
    });
    if (updated.count !== 1) throw new ServiceError("ALREADY_CANCELLED", "This reservation is already cancelled.");

    // Free the slot again (only one active reservation can hold a slot).
    await tx.appointment.update({ where: { id: r.appointmentId }, data: { isReserved: false } });
    return r;
  });

  const view = toReservationView({ ...row, status: "CANCELLED", cancelledBy: actor.type === "admin" ? "ADMIN" : "USER" }, now);

  // The email is sent after the cancellation is safely stored.
  let emailSent: boolean | null = null;
  if (actor.type === "admin" && row.appointment.startTime > now) {
    const mail = reservationCancelledEmail({
      name: row.user.name,
      dayLong: view.dayLong,
      start: view.start,
      end: view.end,
      bookUrl: `${APP_URL}/appointments`,
      hospital: HOSPITAL_NAME,
    });
    emailSent = (await sendEmail({ to: row.user.email, ...mail })).ok;
  }

  return { reservation: view, emailSent };
}

// ---- Reminder preference per reservation (FR-06, FR-11) ----

export async function updateReservationReminder(input: {
  userId: number;
  reservationId: number;
  reminderLeadMinutes: number;
}): Promise<void> {
  if (!isValidReminderMinutes(input.reminderLeadMinutes)) {
    throw new ServiceError("REMINDER_LOCKED", "Choose one of the listed reminder times.");
  }
  const now = new Date();
  const r = await prisma.reservation.findFirst({
    where: { id: input.reservationId, userId: input.userId, status: "ACTIVE" },
    include: { appointment: true },
  });
  if (!r) throw new ServiceError("RESERVATION_NOT_FOUND", "We couldn't find that reservation.");
  if (r.appointment.startTime <= now) throw new ServiceError("RESERVATION_PAST", "This appointment has already started.");
  if (r.reminderSentAt) throw new ServiceError("REMINDER_LOCKED", "The reminder for this appointment has already been sent.");

  await prisma.reservation.update({
    where: { id: r.id },
    data: { reminderLeadMinutes: input.reminderLeadMinutes, reminderAttempts: 0, reminderError: null },
  });
}

// ---- Reading ----

export async function listUserUpcoming(userId: number): Promise<ReservationView[]> {
  const now = new Date();
  const rows = await prisma.reservation.findMany({
    where: { userId, status: "ACTIVE", appointment: { endTime: { gt: now } } },
    include: withRelations,
    orderBy: { appointment: { startTime: "asc" } },
  });
  return rows.map((r) => toReservationView(r, now));
}

/** Finished and cancelled reservations, newest first. */
export async function listUserHistory(userId: number, take = 20): Promise<ReservationView[]> {
  const now = new Date();
  const rows = await prisma.reservation.findMany({
    where: {
      userId,
      OR: [{ status: "CANCELLED" }, { status: "ACTIVE", appointment: { endTime: { lte: now } } }],
    },
    include: withRelations,
    orderBy: { appointment: { startTime: "desc" } },
    take,
  });
  return rows.map((r) => toReservationView(r, now));
}

export async function listReservationsAdmin(input: {
  filter: ReservationFilter;
  q?: string;
  page: number;
  pageSize: number;
}): Promise<Paged<ReservationView>> {
  const now = new Date();
  const where: Prisma.ReservationWhereInput = {};

  if (input.filter === "upcoming") Object.assign(where, { status: "ACTIVE", appointment: { endTime: { gt: now } } });
  if (input.filter === "past") Object.assign(where, { status: "ACTIVE", appointment: { endTime: { lte: now } } });
  if (input.filter === "cancelled") where.status = "CANCELLED";

  const q = input.q?.trim();
  if (q) where.user = { OR: [{ name: { contains: q } }, { email: { contains: q } }] };

  const [total, rows] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      include: withRelations,
      orderBy: { appointment: { startTime: input.filter === "upcoming" ? "asc" : "desc" } },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
  ]);

  return {
    items: rows.map((r) => toReservationView(r, now)),
    page: input.page,
    pageSize: input.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
  };
}

// ---- Admin dashboard numbers ----

export async function getAdminOverview() {
  const now = new Date();
  const { start, end } = dayRangeUtc(dateKeyInTz(now));
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60_000);

  const [todaySlots, todayBooked, upcoming, users, unverified, cancelledWeek, todaysReservations] = await Promise.all([
    prisma.appointment.count({ where: { startTime: { gte: start, lt: end } } }),
    prisma.appointment.count({ where: { startTime: { gte: start, lt: end }, isReserved: true } }),
    prisma.reservation.count({ where: { status: "ACTIVE", appointment: { endTime: { gt: now } } } }),
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: false } }),
    prisma.reservation.count({ where: { status: "CANCELLED", cancelledAt: { gte: weekAgo } } }),
    prisma.reservation.findMany({
      where: { status: "ACTIVE", appointment: { startTime: { gte: start, lt: end } } },
      include: withRelations,
      orderBy: { appointment: { startTime: "asc" } },
    }),
  ]);

  return {
    todaySlots,
    todayBooked,
    upcoming,
    users,
    unverified,
    cancelledWeek,
    today: todaysReservations.map((r) => toReservationView(r, now)),
  };
}
