import { createServiceClient } from "@/lib/supabase/service";
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
  const supabase = createServiceClient();

  const [staffRes, servicesRes, staffServicesRes] = await Promise.all([
    supabase.from("staff_members").select("*").order("display_order"),
    supabase.from("services").select("*").order("display_order"),
    supabase.from("staff_services").select("*"),
  ]);
  if (staffRes.error) throw new Error(staffRes.error.message);
  if (servicesRes.error) throw new Error(servicesRes.error.message);
  if (staffServicesRes.error) throw new Error(staffServicesRes.error.message);
  const { data: staff } = staffRes;
  const { data: services } = servicesRes;
  const { data: staffServices } = staffServicesRes;

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
