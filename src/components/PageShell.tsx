import type { ReactNode } from "react";
import { KawaiiBackground } from "@/components/KawaiiBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function PageShell({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <KawaiiBackground />
      <Navbar signedIn={signedIn} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
