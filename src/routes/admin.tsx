import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Ban, CheckCircle2, Megaphone, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/PageShell";
import {
  adminBroadcast,
  adminDeleteWhisper,
  adminLogin,
  adminOverview,
  adminSetUserStatus,
  adminToggleAnnouncement,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin — A Whispr" },
      { name: "description", content: "Restricted admin console for A Whispr moderators." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Super Admin — A Whispr" },
      { property: "og:description", content: "Restricted admin console for A Whispr." },
    ],
  }),
  component: AdminPage,
});

type Overview = Awaited<ReturnType<typeof adminOverview>>;
type Creds = { username: string; password: string };

function AdminPage() {
  const [creds, setCreds] = useState<Creds | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const refresh = useCallback(async (c: Creds) => {
    const next = await adminOverview({ data: c });
    setData(next);
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const c = { username, password };
      await adminLogin({ data: c });
      await refresh(c);
      setCreds(c);
      toast.success("Welcome, admin 🛡️");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function run(fn: () => Promise<unknown>, message: string) {
    if (!creds) return;
    try {
      await fn();
      await refresh(creds);
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  }

  if (!creds || !data) {
    return (
      <PageShell signedIn={false}>
        <form onSubmit={login} className="retro-window mx-auto max-w-sm space-y-4 p-8">
          <h1 className="text-center text-2xl font-extrabold candy-text">Super Admin</h1>
          <div className="space-y-1.5">
            <Label htmlFor="admin-user">Username</Label>
            <Input
              id="admin-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-2xl border-2"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-pass">Password</Label>
            <Input
              id="admin-pass"
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
            className="w-full rounded-full border-2 border-border bouncy"
          >
            Enter panel
          </Button>
        </form>
      </PageShell>
    );
  }

  return (
    <PageShell signedIn={false}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold candy-text">Admin Panel</h1>
        <Button
          onClick={() => void run(async () => {}, "Refreshed")}
          variant="secondary"
          size="sm"
          className="rounded-full border-2 border-border bouncy"
        >
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Users", value: data.stats.totalUsers },
          { label: "Whispers", value: data.stats.totalWhispers },
          { label: "Live announcements", value: data.stats.activeAnnouncements },
        ].map((s) => (
          <div key={s.label} className="retro-window p-5 text-center">
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="retro-window mt-6 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Megaphone className="size-5" /> Global announcement
        </h2>
        <div className="mt-4 space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-2xl border-2"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message to everyone..."
            className="rounded-2xl border-2"
            rows={3}
          />
          <Button
            onClick={() =>
              void run(async () => {
                if (!title.trim() || !body.trim()) throw new Error("Title and body required");
                await adminBroadcast({ data: { ...creds, title, body } });
                setTitle("");
                setBody("");
              }, "Announcement published")
            }
            className="rounded-full border-2 border-border bouncy shadow-[var(--shadow-pop)]"
          >
            Broadcast
          </Button>
        </div>

        <ul className="mt-5 space-y-2">
          {data.announcements.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-border px-4 py-2"
            >
              <span className="text-sm">
                <strong>{a.title}</strong> — {a.body}
              </span>
              <Button
                size="sm"
                variant={a.active ? "secondary" : "default"}
                className="rounded-full border-2 border-border"
                onClick={() =>
                  void run(
                    () => adminToggleAnnouncement({ data: { ...creds, id: a.id, active: !a.active } }),
                    a.active ? "Hidden" : "Shown",
                  )
                }
              >
                {a.active ? "Hide" : "Show"}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="retro-window mt-6 p-6">
        <h2 className="text-xl font-bold">Users</h2>
        <ul className="mt-3 space-y-2">
          {data.users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-border px-4 py-2 text-sm"
            >
              <span>
                @{u.username ?? "unknown"}{" "}
                <span className="text-muted-foreground">({u.status})</span>
              </span>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full border-2 border-border"
                onClick={() =>
                  void run(
                    () =>
                      adminSetUserStatus({
                        data: {
                          ...creds,
                          id: u.id,
                          status: u.status === "suspended" ? "active" : "suspended",
                        },
                      }),
                    "User updated",
                  )
                }
              >
                {u.status === "suspended" ? (
                  <>
                    <CheckCircle2 className="size-4" /> Unsuspend
                  </>
                ) : (
                  <>
                    <Ban className="size-4" /> Suspend
                  </>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="retro-window mt-6 p-6">
        <h2 className="text-xl font-bold">Recent whispers</h2>
        <ul className="mt-3 space-y-2">
          {data.whispers.map((w) => (
            <li
              key={w.id}
              className="flex items-start justify-between gap-3 rounded-2xl border-2 border-border px-4 py-2 text-sm"
            >
              <span>
                <strong>{w.vibe_tag ?? "Mystery"}</strong> — {w.content}
              </span>
              <button
                aria-label="Delete whisper"
                className="text-muted-foreground hover:text-destructive"
                onClick={() =>
                  void run(() => adminDeleteWhisper({ data: { ...creds, id: w.id } }), "Deleted")
                }
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
