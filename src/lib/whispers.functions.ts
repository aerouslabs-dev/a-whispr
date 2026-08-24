import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type VibeResult = { vibe_tag: string; ai_reply: string };

function serverClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function analyzeWhisper(content: string): Promise<VibeResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { vibe_tag: "100% Mystery", ai_reply: "Ei message ta rohossomoy! 👀" };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are the fun engine of 'A Whispr', an anonymous messaging app used by Bangladeshi Gen-Z. " +
              "Messages can be in Bengali, English or Banglish slang. " +
              "Return STRICT JSON only: {\"vibe_tag\":\"...\",\"ai_reply\":\"...\"}. " +
              "vibe_tag is a short percentage-style label like '90% Crush', '99% Savage Roast', '75% Friendzone Alert'. " +
              "ai_reply is ONE witty playful comeback line (max 15 words), same language/slang style as the message, never rude about identity, no slurs.",
          },
          { role: "user", content: content.slice(0, 600) },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI gateway ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no json");
    const parsed = JSON.parse(match[0]) as Partial<VibeResult>;
    return {
      vibe_tag: (parsed.vibe_tag ?? "100% Mystery").slice(0, 40),
      ai_reply: (parsed.ai_reply ?? "Whisper received! 💌").slice(0, 200),
    };
  } catch (error) {
    console.error("analyzeWhisper failed", error);
    return { vibe_tag: "100% Mystery", ai_reply: "Ei whisper ta secret e thak! 🤫" };
  }
}

export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .ilike("username", data.username)
      .maybeSingle();
    return profile ?? null;
  });

export const sendWhisper = createServerFn({ method: "POST" })
  .inputValidator((data: {
    username: string;
    content: string;
    triviaQuestion?: string | null;
    triviaOptions?: unknown[] | null;
    triviaCorrectIndex?: number | null;
    hintLetter?: string | null;
    deleteAfterRead?: boolean | null;
    deleteAfterHours?: number | null;
  }) => {
    const content = data.content?.trim() ?? "";
    if (content.length < 2) throw new Error("Whisper is too short");
    if (content.length > 600) throw new Error("Whisper is too long");

    const normalizedQuestion = data.triviaQuestion?.trim() ?? "";
    const options = (Array.isArray(data.triviaOptions) ? data.triviaOptions : [])
      .map((value) => String(value).trim())
      .filter(Boolean)
      .slice(0, 4);

    if (normalizedQuestion) {
      if (options.length < 2) throw new Error("Trivia needs at least 2 answer choices");
      const correctIndex = Number(data.triviaCorrectIndex ?? -1);
      if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
        throw new Error("Pick a valid trivia answer index");
      }
      const hintLetter = (data.hintLetter ?? "").trim().slice(0, 1).toUpperCase();
      if (!hintLetter) throw new Error("Mention the first-letter hint for the answer");
      return {
        username: data.username,
        content,
        triviaQuestion: normalizedQuestion,
        triviaOptions: options,
        triviaCorrectIndex: correctIndex,
        hintLetter,
        deleteAfterRead: !!data.deleteAfterRead,
        deleteAfterHours: Number(data.deleteAfterHours ?? 24),
      };
    }

    return {
      username: data.username,
      content,
      triviaQuestion: null,
      triviaOptions: [],
      triviaCorrectIndex: null,
      hintLetter: null,
      deleteAfterRead: !!data.deleteAfterRead,
      deleteAfterHours: Number(data.deleteAfterHours ?? 24),
    };
  })
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", data.username)
      .maybeSingle();
    if (!profile) throw new Error("That whisperer doesn't exist");

    const vibe = await analyzeWhisper(data.content);

    const { error } = await supabase.from("whispers").insert({
      recipient_id: profile.id,
      content: data.content,
      vibe_tag: vibe.vibe_tag,
      ai_reply: vibe.ai_reply,
      trivia_question: data.triviaQuestion ?? null,
      trivia_options: data.triviaOptions && data.triviaOptions.length ? data.triviaOptions : null,
      trivia_correct_index: data.triviaCorrectIndex ?? null,
      hint_letter: data.hintLetter ?? null,
      delete_after_read: data.deleteAfterRead ?? false,
      delete_after_hours: data.deleteAfterHours ?? 24,
    });
    if (error) throw new Error(error.message);

    return vibe;
  });
