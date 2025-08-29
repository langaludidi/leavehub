import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Table, THead, TH, TBody, TD } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";

async function fetchHistory() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return [];
  const { data } = await supabase
    .from("leave_requests")
    .select("id,start_date,end_date,status,leave_type,total_days,reason,created_at,approved_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default function History() {
  const q = useQuery({ queryKey: ["history"], queryFn: fetchHistory });

  return (
    <Card>
      <CardHeader title="My Leave History" />
      <CardBody className="overflow-x-auto">
        {q.isLoading && <div className="h-28 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded" />}
        {!q.isLoading && (
          <Table>
            <THead>
              <tr><TH>Type</TH><TH>Dates</TH><TH>Days</TH><TH>Status</TH><TH>Submitted</TH></tr>
            </THead>
            <TBody>
              {(q.data || []).map((r: any) => (
                <tr key={r.id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {r.leave_type === 'vacation' ? '🏖️' : 
                         r.leave_type === 'sick' ? '🤒' :
                         r.leave_type === 'personal' ? '👤' :
                         r.leave_type === 'maternity' ? '👶' :
                         r.leave_type === 'bereavement' ? '🕊️' : '📋'}
                      </span>
                      <span className="capitalize">{r.leave_type || "Leave"}</span>
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm">
                      <div>{new Date(r.start_date).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(r.end_date).toLocaleDateString()}</div>
                    </div>
                  </TD>
                  <TD>{r.total_days || 1} day{(r.total_days || 1) !== 1 ? 's' : ''}</TD>
                  <TD>
                    {r.status === "approved" && <Badge tone="green">Approved</Badge>}
                    {r.status === "pending"  && <Badge tone="yellow">Pending</Badge>}
                    {r.status === "denied"   && <Badge tone="red">Denied</Badge>}
                  </TD>
                  <TD>{new Date(r.created_at).toLocaleDateString()}</TD>
                </tr>
              ))}
              {(!q.data || q.data.length === 0) && (
                <tr>
                  <TD colSpan={5} className="text-center py-8 text-gray-500">
                    No leave requests found. <a href="/employee/request" className="link">Submit your first request</a>
                  </TD>
                </tr>
              )}
            </TBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}
