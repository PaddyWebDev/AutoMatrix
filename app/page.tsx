import GuestNavbar from "@/components/guest-navbar";
import Link from "next/link";
import { ClipboardList, FileText } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 px-6 py-10 flex flex-col items-center">
      <GuestNavbar />
      <section className="max-w-5xl w-full text-center space-y-6 mt-[10dvh]">
        <h1 className="text-4xl md:text-6xl font-bold">Auto Matrix</h1>
        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          A streamlined service center management system to handle appointments,
          invoices, inventory, and customer interactions effortlessly.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 max-w-3xl w-full">
        <Link href="/guest/Login" className="group p-6 rounded-2xl bg-neutral-200 dark:bg-neutral-800 shadow hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <ClipboardList className="w-10 h-10" />
            <div>
              <h3 className="text-xl font-semibold group-hover:underline">Login</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Access your Auto Matrix account</p>
            </div>
          </div>
        </Link>

        <Link href="/guest/Register" className="group p-6 rounded-2xl bg-neutral-200 dark:bg-neutral-800 shadow hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10" />
            <div>
              <h3 className="text-xl font-semibold group-hover:underline">Register</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Create a new Auto Matrix account</p>
            </div>
          </div>
        </Link>
      </section>
    </main>
  );
}
