import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/PageShell";
import { getPublicProfile, sendWhisper } from "@/lib/whispers.functions";
import logo from "@/assets/whispr-logo.png";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const profile = await getPublicProfile({ data: { username: params.username } });
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Whisperer not found — A Whispr" }, { name: "robots", content: "noindex" }],
      };
    }
    const name = loaderData.profile.display_name ?? loaderData.profile.username ?? params.username;
    const title = `Send @${loaderData.profile.username} an anonymous whisper — A Whispr`;
    const description = `Drop ${name} a 100% anonymous message in Bangla, English or Banglish. They'll never know it was you.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <NotFoundPage />,
  notFoundComponent: () => <NotFoundPage />,
  component: SubmissionPage,
});

function NotFoundPage() {
  return (
    <PageShell signedIn={false}>
      <div className="retro-window mx-auto max-w-md p-8 text-center">
        <div className="text-5xl">🥺</div>
        <h1 className="mt-3 text-2xl font-extrabold candy-text">Whisperer not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link doesn&apos;t belong to anyone yet. Want your own?
        </p>
        <Button asChild className="mt-5 rounded-full border-2 border-border bouncy">
          <Link to="/auth">Claim your link</Link>
        </Button>
      </div>
    </PageShell>
  );
}

function SubmissionPage() {
  const { profile } = Route.useLoaderData();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [triviaQuestion, setTriviaQuestion] = useState("");
  const [triviaOptions, setTriviaOptions] = useState(["", ""]);
  const [triviaCorrectIndex, setTriviaCorrectIndex] = useState(0);
  const [hintLetter, setHintLetter] = useState("");
  const [deleteAfterRead, setDeleteAfterRead] = useState(false);
  const [deleteAfterHours, setDeleteAfterHours] = useState(24);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ vibe_tag: string; ai_reply: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const vibe = await sendWhisper({
        data: {
          username: profile.username ?? "",
          content,
          triviaQuestion,
          triviaOptions,
          triviaCorrectIndex,
          hintLetter,
          deleteAfterRead,
          deleteAfterHours,
        },
      });
      setResult(vibe);
      setContent("");
      setTriviaQuestion("");
      setTriviaOptions(["", ""]);
      setTriviaCorrectIndex(0);
      setHintLetter("");
      setDeleteAfterRead(false);
      setDeleteAfterHours(24);
      toast.success("Whisper sent anonymously 💌");
      void router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send whisper");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell signedIn={false}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="retro-window mx-auto max-w-lg p-8 text-center"
      >
        <img src={logo} alt="" width={88} height={88} className="mx-auto h-20 w-20" />
        <h1 className="mt-3 text-2xl font-extrabold candy-text">
          Send @{profile.username} a whisper
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.bio ?? "100% anonymous. They will never know it was you 🤫"}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4 text-left">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={600}
            required
            placeholder="Tomake ekta kotha bolar chilo... 💭"
            className="rounded-3xl border-2 text-base"
          />

          <div className="rounded-3xl border-2 border-dashed border-border bg-accent/20 p-4">
            <label className="mb-2 block text-sm font-bold">Optional trivia lock</label>
            <input
              value={triviaQuestion}
              onChange={(e) => setTriviaQuestion(e.target.value)}
              placeholder="Question to unlock the first-letter hint"
              className="mb-2 w-full rounded-2xl border-2 border-border bg-background px-3 py-2 text-sm outline-none"
            />

            <div className="grid gap-2">
              {triviaOptions.map((option, index) => (
                <div key={`${index}-option`} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-muted-foreground">{index + 1}</span>
                  <input
                    value={option}
                    onChange={(e) => {
                      const next = [...triviaOptions];
                      next[index] = e.target.value;
                      setTriviaOptions(next);
                    }}
                    placeholder={`Choice ${index + 1}`}
                    className="w-full rounded-2xl border-2 border-border bg-background px-3 py-2 text-sm outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Correct answer
              </label>
              <select
                value={triviaCorrectIndex}
                onChange={(e) => setTriviaCorrectIndex(Number(e.target.value))}
                className="rounded-xl border-2 border-border bg-background px-2 py-1.5 text-sm"
              >
                {triviaOptions.map((_, index) => (
                  <option key={index} value={index}>
                    Choice {index + 1}
                  </option>
                ))}
              </select>
            </div>

            <input
              value={hintLetter}
              onChange={(e) => setHintLetter(e.target.value.slice(0, 1).toUpperCase())}
              placeholder="Hint letter (A, B, C...)"
              maxLength={1}
              className="mt-3 w-full rounded-2xl border-2 border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="rounded-3xl border-2 border-dashed border-border bg-bubble/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">Self-destruct whisper</p>
                <p className="text-xs text-muted-foreground">Optional security layer</p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteAfterRead((value) => !value)}
                className="inline-flex items-center gap-2 text-sm font-semibold"
                aria-label="Toggle auto-delete"
              >
                {deleteAfterRead ? <ToggleRight className="size-6 text-primary" /> : <ToggleLeft className="size-6 text-muted-foreground" />}
                Read once
              </button>
            </div>

            {!deleteAfterRead && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Delete after
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={deleteAfterHours}
                  onChange={(e) => setDeleteAfterHours(Number(e.target.value) || 24)}
                  className="w-20 rounded-xl border-2 border-border bg-background px-2 py-1.5 text-sm"
                />
                <span className="text-xs text-muted-foreground">hours</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full border-2 border-border bouncy shadow-[var(--shadow-pop)]"
          >
            <Send className="size-4" /> {busy ? "Sending..." : "Send anonymously"}
          </Button>
        </form>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-3xl border-2 border-border bg-bubble/70 p-5"
            >
              <p className="text-lg font-extrabold">{result.vibe_tag}</p>
              <p className="mt-1 text-sm">{result.ai_reply}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 rounded-3xl border-2 border-dashed border-border p-5">
          <p className="text-sm font-bold">Want your own whisper link?</p>
          <Button asChild className="mt-3 rounded-full border-2 border-border bouncy">
            <Link to="/auth">
              <Sparkles className="size-4" /> Create mine free
            </Link>
          </Button>
        </div>
      </motion.div>
    </PageShell>
  );
}
