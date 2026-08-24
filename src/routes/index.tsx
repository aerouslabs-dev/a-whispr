import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Flame, Ghost, Heart, Instagram, Link2, Sparkles, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ShareCard } from "@/components/ShareCard";
import { TriviaHint } from "@/components/TriviaHint";
import logo from "@/assets/whispr-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Whispr — Cute Anonymous Whispers for Bangladesh" },
      {
        name: "description",
        content:
          "Share your A Whispr link, collect anonymous whispers in Bangla, English or Banglish, and get an instant AI vibe tag with a witty comeback.",
      },
      { property: "og:title", content: "A Whispr — Cute Anonymous Whispers" },
      {
        property: "og:description",
        content: "Get anonymous whispers with AI vibe tags. Share your link, read your inbox.",
      },
    ],
  }),
  component: Home,
});

type Whisper = {
  id: string;
  content: string;
  vibe_tag: string | null;
  ai_reply: string | null;
  created_at: string;
  trivia_question?: string | null;
  trivia_options?: string[] | null;
  trivia_correct_index?: number | null;
  hint_letter?: string | null;
};

type Announcement = { id: string; title: string; body: string };

function Home() {
  const { user, profile, loading } = useAuth();
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedStory, setSelectedStory] = useState<Whisper | null>(null);
  const [reactions, setReactions] = useState<Record<string, { emoji: string; count: number }[]>>({});

  const loadWhispers = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("whispers")
      .select(
        "id, content, vibe_tag, ai_reply, created_at, trivia_question, trivia_options, trivia_correct_index, hint_letter",
      )
      .order("created_at", { ascending: false });
    setWhispers((data ?? []) as Whisper[]);
  }, [user]);

  useEffect(() => {
    void loadWhispers();
  }, [loadWhispers]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, body")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      setAnnouncements((data ?? []) as Announcement[]);
    })();
  }, []);

  const publicLink =
    typeof window !== "undefined" && profile?.username
      ? `${window.location.origin}/u/${profile.username}`
      : "";

  async function copyLink() {
    await navigator.clipboard.writeText(publicLink);
    toast.success("Link copied! Go paste it everywhere 💕");
  }

  async function shareInstagram() {
    const text = `Send me an anonymous whisper 💌 ${publicLink}`;
    const igStory = `instagram-stories://share?source_application=awhispr`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "A Whispr", text, url: publicLink });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("Link copied — opening Instagram!");
      window.location.href = igStory;
      setTimeout(() => window.open("https://www.instagram.com/", "_blank"), 900);
    } catch {
      /* user dismissed the share sheet */
    }
  }

  async function removeWhisper(id: string) {
    const { error } = await supabase.from("whispers").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setWhispers((prev) => prev.filter((w) => w.id !== id));
    toast.success("Whisper deleted");
  }

  function getMoodClass(text: string) {
    const lower = text.toLowerCase();
    if (/(love|miss|crush|cute|heart|honey|baby)/.test(lower)) return "bg-pink-100 text-pink-900";
    if (/(lol|haha|roast|meme|funny|jk|lmao)/.test(lower)) return "bg-yellow-100 text-yellow-900";
    if (/(spicy|hot|flirty|tease|fire|drama)/.test(lower)) return "bg-rose-100 text-rose-900";
    return "bg-sky-100 text-sky-900";
  }

  function reactToWhisper(id: string, emoji: string) {
    setReactions((prev) => {
      const current = prev[id] ?? [
        { emoji: "🔥", count: 0 },
        { emoji: "💀", count: 0 },
        { emoji: "🥹", count: 0 },
        { emoji: "❤️", count: 0 },
      ];
      const next = current.map((entry) =>
        entry.emoji === emoji ? { ...entry, count: entry.count + 1 } : entry,
      );
      return { ...prev, [id]: next };
    });
    toast.success(`Reacted with ${emoji}`);
  }

  return (
    <PageShell signedIn={!!user}>
      {selectedStory && <ShareCard whisper={selectedStory} onClose={() => setSelectedStory(null)} />}
      <AnimatePresence>
        {announcements.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-3xl border-2 border-border bg-lemon/70 px-5 py-3 text-foreground shadow-[var(--shadow-soft)]"
          >
            <p className="font-display text-lg font-bold">📢 {a.title}</p>
            <p className="text-sm">{a.body}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {!user && !loading && <GuestLanding />}

      {user && (
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="retro-window p-6"
          >
            <div className="flex items-center gap-3">
              <img src={logo} alt="" width={56} height={56} className="h-14 w-14" loading="lazy" />
              <div>
                <h1 className="text-2xl font-extrabold">
                  Hey @{profile?.username ?? "whisprer"}! 🌸
                </h1>
                <p className="text-sm text-muted-foreground">
                  Share your magic link and collect whispers.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-bubble/60 px-4 py-3">
              <Link2 className="size-4 text-primary" />
              <span className="truncate text-sm font-semibold">{publicLink || "…"}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={copyLink}
                variant="secondary"
                className="rounded-full border-2 border-border bouncy"
              >
                <Copy className="size-4" /> Copy link
              </Button>
              <Button
                onClick={shareInstagram}
                className="rounded-full border-2 border-border bouncy shadow-[var(--shadow-pop)]"
              >
                <Instagram className="size-4" /> Share on Instagram
              </Button>
            </div>
          </motion.section>

          <section>
            <h2 className="mb-3 text-xl font-bold">Your inbox ({whispers.length})</h2>
            {whispers.length === 0 ? (
              <Card className="retro-window border-0">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No whispers yet — share your link and the secrets will start flying in ✨
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {whispers.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="retro-window p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full border-2 border-border bg-accent text-accent-foreground">
                          {w.vibe_tag ?? "Mystery"}
                        </Badge>
                        <Badge className={getMoodClass(w.content)}>{w.content.toLowerCase().includes("love") ? "Romantic" : w.content.toLowerCase().includes("lol") ? "Funny" : w.content.toLowerCase().includes("hot") ? "Spicy" : "Sad"}</Badge>
                      </div>
                      <button
                        onClick={() => void removeWhisper(w.id)}
                        aria-label="Delete whisper"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-base font-medium">{w.content}</p>
                    {w.ai_reply && (
                      <p className="mt-3 rounded-2xl bg-bubble px-3 py-2 text-sm text-bubble-foreground">
                        <Wand2 className="mr-1 inline size-3" /> {w.ai_reply}
                      </p>
                    )}
                    <TriviaHint whisper={w} />
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {[
                        { emoji: "🔥", label: "Fire" },
                        { emoji: "💀", label: "Dead" },
                        { emoji: "🥹", label: "Touched" },
                        { emoji: "❤️", label: "Love" },
                      ].map(({ emoji, label }) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => reactToWhisper(w.id, emoji)}
                          className="group inline-flex items-center gap-2 rounded-full border-2 border-border bg-background px-2.5 py-1.5 text-xs font-semibold transition-transform hover:-translate-y-0.5"
                          aria-label={`React ${label}`}
                        >
                          <span className="text-base transition-transform duration-200 group-hover:scale-125">{emoji}</span>
                          <span>{reactions[w.id]?.find((r) => r.emoji === emoji)?.count ?? 0}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedStory(w)} className="rounded-full border-2 border-border">
                        Answer
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {new Date(w.created_at).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PageShell>
  );
}

function GuestLanding() {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="retro-window p-8 text-center"
      >
        <motion.img
          src={logo}
          alt="A Whispr kawaii mascot"
          width={140}
          height={140}
          className="mx-auto h-32 w-32"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <h1 className="mt-4 text-4xl font-extrabold candy-text">A Whispr</h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Anonymous whispers, kawaii style. Bangla, English or Banglish — our AI tags every message
          with a vibe and fires back a witty one-liner.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full border-2 border-border bouncy shadow-[var(--shadow-pop)]"
          >
            <Link to="/auth">
              <Sparkles className="size-4" /> Get my whisper link
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full border-2 border-border bouncy"
          >
            <Link to="/settings">Explore as guest</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Guests can browse freely — sign in to send and receive whispers.
        </p>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { emoji: "🔗", title: "Get your link", body: "/u/yourname — cute and shareable." },
          { emoji: "🤖", title: "AI vibe tags", body: "'90% Crush' or '99% Savage Roast'." },
          { emoji: "📸", title: "1-tap IG share", body: "Straight to your Instagram story." },
        ].map((f) => (
          <motion.div key={f.title} whileHover={{ y: -6 }} className="retro-window p-6 text-center">
            <div className="text-4xl">{f.emoji}</div>
            <h3 className="mt-2 text-lg font-bold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.body}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
