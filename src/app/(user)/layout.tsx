import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireUser } from "@/lib/auth";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await requireUser(); // every page in this area needs a signed-in user
  return (
    <>
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
        <aside>
          <Sidebar />
        </aside>
        <main id="content" className="min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
