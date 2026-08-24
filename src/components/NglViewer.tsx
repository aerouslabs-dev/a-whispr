import { useEffect, useRef, useState } from "react";
import * as NGL from "ngl";

type ViewerMode = "cartoon" | "ball-stick" | "surface";

export function NglViewer({ mode = "cartoon" }: { mode?: ViewerMode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const stage = new NGL.Stage(containerRef.current, {
      backgroundColor: "white",
      antialias: true,
      clipNear: 0.01,
      clipFar: 100,
    });

    const handle = async () => {
      try {
        NGL.ColormakerRegistry.addScheme("awhisprScheme", {
          scale: (value: number) => {
            const palette = ["#ff8bbd", "#8bd3dd", "#f9d423", "#a78bfa", "#6ee7b7"];
            return palette[Math.abs(Math.round(value)) % palette.length];
          },
        });

        const structure = await stage.loadFile("rcsb://1crn");

        if (mode === "surface") {
          structure.addRepresentation("surface", { color: "sstruc", opacity: 0.26 });
          structure.addRepresentation("cartoon", { color: "residueindex", linewidth: 1.2 });
        } else if (mode === "ball-stick") {
          structure.addRepresentation("ball+stick", { color: "awhisprScheme", scale: 1.2 });
          structure.addRepresentation("cartoon", { color: "residueindex", linewidth: 1.1, opacity: 0.5 });
        } else {
          structure.addRepresentation("cartoon", { color: "residueindex", linewidth: 1.4 });
          structure.addRepresentation("ball+stick", { color: "awhisprScheme", scale: 1.15, opacity: 0.4 });
        }

        stage.autoView();
        setReady(true);
      } catch {
        setReady(false);
      }
    };

    void handle();

    return () => {
      stage.removeAllComponents();
      stage.dispose();
    };
  }, [mode]);

  return (
    <div className="rounded-[1.5rem] border-2 border-border bg-white p-3 shadow-[var(--shadow-soft)]">
      <div ref={containerRef} className="h-64 w-full overflow-hidden rounded-[1.2rem] bg-white" />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Structural preview</span>
        <span>{ready ? "Ready" : "Loading"}</span>
      </div>
    </div>
  );
}
