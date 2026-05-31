import { createClient } from "@/lib/supabase/server";
import { StaffClient } from "./StaffClient";
import {
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  toggleStaffVisibility,
  updateStaffServices,
} from "./actions";
import type { StaffMember, DbService } from "@/lib/types/db";

export default async function StaffAdminPage() {
  const supabase = await createClient();

  const [{ data: staff }, { data: services }, { data: staffServices }] = await Promise.all([
    supabase.from("staff_members").select("*").order("display_order"),
    supabase.from("services").select("*").order("display_order"),
    supabase.from("staff_services").select("*"),
  ]);

  const staffServiceMap: Record<string, string[]> = {};
  for (const row of staffServices ?? []) {
    if (!staffServiceMap[row.staff_id]) staffServiceMap[row.staff_id] = [];
    staffServiceMap[row.staff_id].push(row.service_id);
  }

  return (
    <StaffClient
      initialStaff={(staff ?? []) as StaffMember[]}
      initialServices={(services ?? []) as DbService[]}
      staffServiceMap={staffServiceMap}
      onCreate={createStaffMember}
      onUpdate={updateStaffMember}
      onDelete={deleteStaffMember}
      onToggleVisibility={toggleStaffVisibility}
      onUpdateServices={updateStaffServices}
    />
  );
}
