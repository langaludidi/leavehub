import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/Toast";
import { useEffect, useState } from "react";

async function myOrg() {
  const { data } = await supabase.auth.getUser();
  return (data.user?.app_metadata as any)?.org_id as string | undefined;
}

export default function Holidays() {
  const toast = useToast();
  const [orgId, setOrgId] = useState("");
  const [country, setCountry] = useState("ZA");
  const [year, setYear] = useState(new Date().getFullYear());
  const base = import.meta.env.VITE_FUNCTIONS_URL || `${window.location.origin}/functions/v1`;

  useEffect(() => { (async () => setOrgId((await myOrg()) || ""))(); }, []);
  const q = useQuery({
    queryKey: ["holidays", orgId],
    enabled: !!orgId,
    queryFn: async () => (await supabase.from("holidays").select("*").eq("org_id", orgId).order("date")).data || []
  });

  const importHolidays = async () => {
    try {
      const res = await fetch(`${base}/holidays-import`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId, country, year })
      });
      if (!res.ok) throw new Error(`Import failed: ${res.status}`);
      const j = await res.json();
      toast(`Imported ${j.imported} holidays`, "success");
      q.refetch();
    } catch (e: any) { toast(e.message, "error"); }
  };

  return (
    <div className="space-y-3">
      <h2 className="h2">Holidays</h2>
      <div className="card p-3 flex items-end gap-2">
        <label className="text-sm">Country
          <input className="border rounded px-2 py-1 ml-2 w-24" value={country} onChange={e => setCountry(e.target.value.toUpperCase())} />
        </label>
        <label className="text-sm">Year
          <input type="number" className="border rounded px-2 py-1 ml-2 w-28" value={year} onChange={e => setYear(parseInt(e.target.value || String(new Date().getFullYear())))} />
        </label>
        <button className="btn btn-primary" onClick={importHolidays} disabled={!orgId}>Auto‑Import</button>
      </div>

      <ul className="space-y-1">
        {q.data?.map((h: any) => (
          <li key={h.id} className="text-sm">{h.date} {h.name}</li>
        ))}
      </ul>
    </div>
  );
}
