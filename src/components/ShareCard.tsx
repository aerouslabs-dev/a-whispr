import { useRef } from "react";
import { toPng } from "html-to-image";
import { Download, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ShareCardWhisper = {
  id: string;
  content: string;
  vibe_tag?: string | null;
  ai_reply?: string | null;
  trivia_question?: string | null;
  trivia_options?: string[] | null;
  trivia_correct_index?: number | null;
  hint_letter?: string | null;
};

const moodStyles = {
  Sad: {
    shell: "bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-100",
    badge: "bg-sky-100 text-sky-900",
    chip: "bg-indigo-100 text-indigo-900",
  },
  Funny: {
    shell: "bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100",
    badge: "bg-yellow-100 text-yellow-900",
    chip: "bg-orange-100 text-orange-900",
  },
  Spicy: {
    shell: "bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100",
    badge: "bg-rose-100 text-rose-900",
    chip: "bg-pink-100 text-pink-900",
  },
  Romantic: {
    shell: "bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100",
    badge: "bg-pink-100 text-pink-900",
    chip: "bg-purple-100 text-purple-900",
  },
} as const;

function detectMood(text: string) {
  const lower = text.toLowerCase();

  if (/(love|miss you|crush|romantic|cute|heart|honey|baby)/.test(lower)) return "Romantic";
  if (/(fire|spicy|hot|drama|tease|seduce|flirty)/.test(lower)) return "Spicy";
  if (/(lol|haha|funny|jk|lmao|meme|roast|savage)/.test(lower)) return "Funny";
  return "Sad";
}

export function ShareCard({ whisper, onClose }: { whisper: ShareCardWhisper; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mood = detectMood(whisper.content);
  const theme = moodStyles[mood] ?? moodStyles.Sad;

  async function exportStory() {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "awhispr-story.png";
      link.href = dataUrl;
      link.click();
    } catch {
      // no-op; export is optional in browser sessions
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border-4 border-border bg-white shadow-2xl">
        <div ref={ref} className={cn("p-5", theme.shell)}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className={cn("rounded-full px-3 py-1 text-xs font-bold", theme.badge)}>{mood}</div>
            <div className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide", theme.chip)}>
              A Whispr story
            </div>
          </div>

          <div className="rounded-[1.5rem] border-2 border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Anonymous whisper</p>
            <p className="mt-3 whitespace-pre-wrap text-base font-medium text-foreground">{whisper.content}</p>
            {whisper.trivia_question && (
              <div className="mt-4 rounded-2xl border border-border bg-background/60 p-3 text-sm">
                <p className="font-bold">Question:</p>
                <p>{whisper.trivia_question}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-foreground/70">{whisper.vibe_tag ?? "Mystery vibe"}</div>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
              <Sparkles className="size-3.5" /> Shareable
            </div>
          </div>

          {whisper.ai_reply && <p className="mt-3 text-sm italic text-foreground/80">“{whisper.ai_reply}”</p>}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-white p-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-full border-2 border-border">
            <X className="mr-1 size-4" /> Close
          </Button>
          <Button type="button" onClick={exportStory} className="rounded-full border-2 border-border shadow-[var(--shadow-pop)]">
            <Download className="mr-1 size-4" /> Export story
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
