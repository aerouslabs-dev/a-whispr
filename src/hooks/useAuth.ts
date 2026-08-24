import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type WhisprProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<WhisprProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let active = true;
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setProfile(data as WhisprProfile);
        return;
      }
      const fallbackUsername = `whisprer${user.id.replace(/-/g, "").slice(0, 6)}`;
      const { data: created } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: fallbackUsername,
          display_name: user.email?.split("@")[0] ?? fallbackUsername,
        })
        .select("id, username, display_name, avatar_url, is_admin")
        .maybeSingle();
      if (active && created) setProfile(created as WhisprProfile);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  return { session, user, profile, setProfile, loading, isGuest: !user };
}
