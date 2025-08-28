import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/Toast";

export default function CalendarFeeds() {
  const toast = useToast();
  const [orgId, setOrgId] = useState("");
  const [tokenPersonal, setTokenPersonal] = useState<string>("");
  const [tokenOrg, setTokenOrg] = useState<string>("");
  const base = import.meta.env.VITE_FUNCTIONS_URL || `${window.location.origin}/functions/v1`;

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const org = (u.user?.app_metadata as any)?.org_id || "";
      setOrgId(org);
      const { data: t1 } = await supabase.rpc("lms_get_or_rotate_ical_token", { p_org: org, p_user: u.user?.id, p_scope: "personal", p_rotate: false });
      const { data: t2 } = await supabase.rpc("lms_get_or_rotate_ical_token", { p_org: org, p_user: u.user?.id, p_scope: "org", p_rotate: false });
      setTokenPersonal(t1 || ""); setTokenOrg(t2 || "");
    })();
  }, []);

  const personalURL = `${base}/ical?org=${orgId}&token=${tokenPersonal}&scope=personal&include_pending=true`;
  const orgURL = `${base}/ical?org=${orgId}&token=${tokenOrg}&scope=org`;
  const copy = (s: string) => navigator.clipboard.writeText(s).then(() => toast("Copied", "success"));
  const rotate = async (scope: "personal" | "org") => {
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.rpc("lms_get_or_rotate_ical_token", { p_org: (u.user?.app_metadata as any)?.org_id, p_user: u.user?.id, p_scope: scope, p_rotate: true });
    if (error) return toast(error.message, "error");
    if (scope === "personal") setTokenPersonal(data || ""); else setTokenOrg(data || "");
    toast("Rotated token", "success");
  };

  return (
    <div className="space-y-3">
      <h2 className="h2">Calendar Feeds (iCal)</h2>
      <div className="card p-3 space-y-3">
        <div>
          <div className="font-medium">Personal feed</div>
          <div className="text-xs break-all">{personalURL}</div>
          <div className="mt-2 flex gap-2">
            <button className="btn" onClick={() => copy(personalURL)}>Copy URL</button>
            <button className="btn" onClick={() => rotate("personal")}>Rotate Token</button>
          </div>
        </div>
        <div>
          <div className="font-medium">Team / Org feed</div>
          <div className="text-xs break-all">{orgURL}</div>
          <div className="mt-2 flex gap-2">
            <button className="btn" onClick={() => copy(orgURL)}>Copy URL</button>
            <button className="btn" onClick={() => rotate("org")}>Rotate Token</button>
          </div>
        </div>
      </div>
    </div>
  );
}
