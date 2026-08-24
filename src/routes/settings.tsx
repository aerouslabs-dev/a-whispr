import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, Palette, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — A Whispr" },
      {
        name: "description",
        content:
          "Customise your A Whispr profile, tweak the kawaii appearance, and manage your whisper preferences.",
      },
      { property: "og:title", content: "Settings — A Whispr" },
      { property: "og:description", content: "Profile, appearance and preferences for A Whispr." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const THEMES = [
  { id: "bubblegum", label: "Bubblegum", swatch: "linear-gradient(135deg,#ffd1ec,#e5d4ff)" },
  { id: "mint", label: "Mint Soda", swatch: "linear-gradient(135deg,#d3f7ee,#dbeaff)" },
  { id: "peach", label: "Peach Fizz", swatch: "linear-gradient(135deg,#ffe0cc,#ffd6e8)" },
] as const;

function SettingsPage() {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<string>("bubblegum");
  const [motionOn, setMotionOn] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTheme(localStorage.getItem("whispr-theme") ?? "bubblegum");
    setMotionOn(localStorage.getItem("whispr-motion") !== "off");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.classList.remove("theme-bubblegum", "theme-mint", "theme-peach");
    root.classList.add(`theme-${theme}`);
    root.dataset["whisprTheme"] = theme;
    root.dataset["whisprMotion"] = motionOn ? "on" : "off";

    if (theme === "bubblegum") {
      root.style.setProperty("--background", "oklch(0.975 0.022 330)");
      root.style.setProperty("--primary", "oklch(0.72 0.17 350)");
      root.style.setProperty("--accent", "oklch(0.86 0.1 290)");
      root.style.setProperty("--bubble", "oklch(0.93 0.07 340)");
    }

    if (theme === "mint") {
      root.style.setProperty("--background", "oklch(0.965 0.045 165)");
      root.style.setProperty("--primary", "oklch(0.68 0.17 170)");
      root.style.setProperty("--accent", "oklch(0.85 0.09 200)");
      root.style.setProperty("--bubble", "oklch(0.89 0.07 180)");
    }

    if (theme === "peach") {
      root.style.setProperty("--background", "oklch(0.977 0.035 36)");
      root.style.setProperty("--primary", "oklch(0.74 0.18 25)");
      root.style.setProperty("--accent", "oklch(0.89 0.09 50)");
      root.style.setProperty("--bubble", "oklch(0.92 0.06 35)");
    }
  }, [theme, motionOn]);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase.from("profiles").select("bio").eq("id", user.id).maybeSingle();
      setBio((data?.bio as string | null) ?? "");
    })();
  }, [user]);

  function pickTheme(id: string) {
    setTheme(id);
    localStorage.setItem("whispr-theme", id);
    toast.success("Appearance updated ✨");
  }

  function toggleMotion(next: boolean) {
    setMotionOn(next);
    localStorage.setItem("whispr-motion", next ? "on" : "off");
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null, bio: bio.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved 💖");
  }

  return (
    <PageShell signedIn={!!user}>
      <h1 className="text-3xl font-extrabold candy-text">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Make A Whispr feel like yours — colours, motion and your public profile.
      </p>

      <div className="mt-6 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-window p-6"
        >
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Palette className="size-5" /> Appearance
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => pickTheme(t.id)}
                className={`rounded-3xl border-2 p-4 text-left bouncy ${
                  theme === t.id ? "border-primary" : "border-border"
                }`}
              >
                <span
                  aria-hidden
                  className="block h-10 w-full rounded-2xl border-2 border-border"
                  style={{ backgroundImage: t.swatch }}
                />
                <span className="mt-2 block text-sm font-bold">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border-2 border-dashed border-border px-4 py-3">
            <div>
              <p className="font-bold">Bouncy animations</p>
              <p className="text-xs text-muted-foreground">
                Turn off for a calmer, low-motion experience.
              </p>
            </div>
            <Switch checked={motionOn} onCheckedChange={toggleMotion} aria-label="Toggle animations" />
          </div>
        </motion.section>

        {user && (
          <section className="retro-window p-6">
            <h2 className="text-xl font-bold">Your public profile</h2>
            <p className="text-sm text-muted-foreground">
              Shown on your page at /u/{profile?.username ?? "yourname"}
            </p>
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="display">Display name</Label>
                <Input
                  id="display"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-2xl border-2"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Send me something cute 🥺"
                  className="rounded-2xl border-2"
                />
              </div>
              <Button
                onClick={() => void saveProfile()}
                disabled={saving}
                className="rounded-full border-2 border-border bouncy shadow-[var(--shadow-pop)]"
              >
                <Save className="size-4" /> Save profile
              </Button>
            </div>
          </section>
        )}

        <section className="retro-window bg-bubble/50 p-6 text-center">
          <h2 className="text-xl font-bold">Made by Aerous Labs</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            A Whispr is crafted with pastel love by Aerous Labs. Peek at our other experiments.
          </p>
          <Button
            asChild
            className="mt-4 rounded-full border-2 border-border bouncy shadow-[var(--shadow-pop)]"
          >
            <a href="https://aerouslabs.netlify.app" target="_blank" rel="noopener noreferrer">
              Visit Aerous Labs <ExternalLink className="size-4" />
            </a>
          </Button>
        </section>
      </div>
    </PageShell>
  );
}
