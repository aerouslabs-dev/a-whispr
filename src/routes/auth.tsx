import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

import logo from "@/assets/whispr-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — A Whispr" },
      {
        name: "description",
        content: "Create your A Whispr account to get a public link and start collecting whispers.",
      },
      { property: "og:title", content: "Sign in — A Whispr" },
      { property: "og:description", content: "Sign in with email or Google to collect whispers." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void navigate({ to: "/", replace: true });
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
        if (clean.length < 3) throw new Error("Pick a username with 3+ letters");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: clean, display_name: clean },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email if confirmation is required 💌");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
    }
  }

  return (
    <PageShell signedIn={false}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="retro-window mx-auto max-w-md p-8"
      >
        <img src={logo} alt="" width={80} height={80} className="mx-auto h-20 w-20" loading="lazy" />
        <h1 className="mt-2 text-center text-3xl font-extrabold candy-text">
          {mode === "signin" ? "Welcome back!" : "Join A Whispr"}
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cutiepie"
                className="rounded-2xl border-2"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border-2"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border-2"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full border-2 border-border bouncy shadow-[var(--shadow-pop)]"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <Button
          onClick={googleSignIn}
          variant="secondary"
          className="mt-3 w-full rounded-full border-2 border-border bouncy"
        >
          Continue with Google
        </Button>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </PageShell>
  );
}
