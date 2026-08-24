import { createServerFn } from "@tanstack/react-start";

const ADMIN_USERNAME = "admin";

function checkCreds(username: string, password: string) {
  const expected = process.env["ADMIN_PASSWORD"] ?? "adminaera56917";
  const expectedUser = process.env["ADMIN_USERNAME"] ?? ADMIN_USERNAME;
  if (username !== expectedUser || password !== expected) {
    throw new Error("Invalid admin credentials");
  }
}

type Creds = { username: string; password: string };

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: Creds) => data)
  .handler(async ({ data }) => {
    checkCreds(data.username, data.password);
    return { ok: true as const };
  });

export const adminOverview = createServerFn({ method: "POST" })
  .inputValidator((data: Creds) => data)
  .handler(async ({ data }) => {
    checkCreds(data.username, data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [users, whispers, announcements] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, username, display_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin
        .from("whispers")
        .select("id, content, vibe_tag, ai_reply, created_at, recipient_id")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin
        .from("announcements")
        .select("id, title, body, active, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    return {
      users: users.data ?? [],
      whispers: whispers.data ?? [],
      announcements: announcements.data ?? [],
      stats: {
        totalUsers: users.data?.length ?? 0,
        totalWhispers: whispers.data?.length ?? 0,
        activeAnnouncements: (announcements.data ?? []).filter((a) => a.active).length,
      },
    };
  });

export const adminDeleteWhisper = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { id: string }) => data)
  .handler(async ({ data }) => {
    checkCreds(data.username, data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("whispers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminSetUserStatus = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { id: string; status: "active" | "suspended" }) => data)
  .handler(async ({ data }) => {
    checkCreds(data.username, data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminBroadcast = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { title: string; body: string }) => data)
  .handler(async ({ data }) => {
    checkCreds(data.username, data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("announcements")
      .insert({ title: data.title, body: data.body, active: true });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminToggleAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { id: string; active: boolean }) => data)
  .handler(async ({ data }) => {
    checkCreds(data.username, data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("announcements")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
