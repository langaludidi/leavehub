import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Navigate, useLocation } from "react-router-dom";

export default function Protected({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setAuthed(!!data.session);
      setReady(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (!ready) return <div>Loading…</div>;
  if (!authed) return <Navigate to="/sign-in" state={{ from: loc }} replace />;
  return <>{children}</>;
}
