import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LogOut, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/whispr-logo.png";

export function Navbar({ signedIn }: { signedIn: boolean }) {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            src={logo}
            alt="A Whispr cartoon mascot logo"
            width={44}
            height={44}
            className="h-11 w-11 drop-shadow-sm"
            animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="font-display text-2xl font-extrabold candy-text">A Whispr</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-full bouncy">
            <Link to="/settings">
              <Settings className="size-4" /> <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
          {signedIn ? (
            <Button
              onClick={signOut}
              variant="secondary"
              size="sm"
              className="rounded-full bouncy border-2 border-border"
            >
              <LogOut className="size-4" /> <span className="hidden sm:inline">Log out</span>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="rounded-full bouncy border-2 border-border shadow-[var(--shadow-pop)]"
            >
              <Link to="/auth">
                <Sparkles className="size-4" /> Sign in
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
