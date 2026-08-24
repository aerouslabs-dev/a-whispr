import { useMemo, useState } from "react";
import { Check, CircleHelp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WhisperTrivia = {
  id: string;
  trivia_question?: string | null;
  trivia_options?: string[] | null;
  trivia_correct_index?: number | null;
  hint_letter?: string | null;
};

export function TriviaHint({ whisper }: { whisper: WhisperTrivia }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [locked, setLocked] = useState(false);

  const options = useMemo(() => {
    const raw = Array.isArray(whisper.trivia_options) ? whisper.trivia_options : [];
    return raw.filter((value) => value && value.trim().length > 0).slice(0, 4);
  }, [whisper.trivia_options]);

  if (!whisper.trivia_question || options.length < 2) return null;

  const isCorrect = selected !== null && whisper.trivia_correct_index === selected;

  function revealHint() {
    if (selected === null) return;
    setRevealed(selected === whisper.trivia_correct_index);
    if (selected === whisper.trivia_correct_index) {
      setLocked(false);
      return;
    }
    setLocked(true);
  }

  return (
    <div className="mt-4 rounded-3xl border-2 border-dashed border-border bg-accent/30 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground/80">
        <CircleHelp className="size-4" /> Trivia unlock
      </div>

      <p className="font-semibold">{whisper.trivia_question}</p>

      <div className="mt-3 grid gap-2">
        {options.map((option, index) => {
          const isPicked = selected === index;
          const isAnswer = whisper.trivia_correct_index === index && revealed;
          return (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              className={cn(
                "rounded-2xl border-2 px-3 py-2 text-left text-sm transition-colors",
                isPicked && "border-primary bg-primary/10",
                isAnswer && "border-emerald-500 bg-emerald-500/10 text-emerald-700",
              )}
            >
              {index + 1}. {option}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={revealHint}
          className="rounded-full border-2 border-border"
          disabled={selected === null}
        >
          <Check className="mr-1 size-3" /> Check answer
        </Button>

        {isCorrect && (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Correct! ✨
          </span>
        )}
      </div>

      {(revealed || locked) && (
        <div className="mt-3 rounded-2xl bg-background/70 p-3 text-sm">
          {isCorrect ? (
            <>
              <p className="font-semibold text-emerald-700">Unlocked: first letter is {whisper.hint_letter ?? "?"}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-foreground/80">
                <Sparkles className="size-3" /> Hint: {whisper.hint_letter ? `${whisper.hint_letter}...` : "The story begins with this letter."}
              </p>
            </>
          ) : (
            <p className="text-foreground/80">Not quite. Try again or read the whisper again for a fresh clue.</p>
          )}
        </div>
      )}
    </div>
  );
}
