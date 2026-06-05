import { createServiceClient } from "@/lib/supabase/service";
import { StaffClient } from "./StaffClient";
import {
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  toggleStaffVisibility,
  updateStaffServices,
  addStaffPhoto,
  deleteStaffPhoto,
} from "./actions";
import type { StaffMember, DbService, StaffPhoto } from "@/lib/types/db";

export default async function StaffAdminPage() {
  const supabase = createServiceClient();

  const [staffRes, servicesRes, staffServicesRes, staffPhotosRes] = await Promise.all([
    supabase.from("staff_members").select("*").order("display_order"),
    supabase.from("services").select("*").order("display_order"),
    supabase.from("staff_services").select("*"),
    supabase.from("staff_photos").select("*").order("display_order"),
  ]);
  if (staffRes.error) throw new Error(staffRes.error.message);
  if (servicesRes.error) throw new Error(servicesRes.error.message);
  if (staffServicesRes.error) throw new Error(staffServicesRes.error.message);

  const staffServiceMap: Record<string, string[]> = {};
  for (const row of staffServicesRes.data ?? []) {
    if (!staffServiceMap[row.staff_id]) staffServiceMap[row.staff_id] = [];
    staffServiceMap[row.staff_id].push(row.service_id);
  }

  // staff_photos may not exist yet if migration hasn't been run — treat as empty
  const staffPhotosMap: Record<string, StaffPhoto[]> = {};
  for (const row of (!staffPhotosRes.error ? (staffPhotosRes.data ?? []) : []) as StaffPhoto[]) {
    if (!staffPhotosMap[row.staff_id]) staffPhotosMap[row.staff_id] = [];
    staffPhotosMap[row.staff_id].push(row);
  }

  return (
    <StaffClient
      initialStaff={(staffRes.data ?? []) as StaffMember[]}
      initialServices={(servicesRes.data ?? []) as DbService[]}
      staffServiceMap={staffServiceMap}
      initialStaffPhotos={staffPhotosMap}
      onCreate={createStaffMember}
      onUpdate={updateStaffMember}
      onDelete={deleteStaffMember}
      onToggleVisibility={toggleStaffVisibility}
      onUpdateServices={updateStaffServices}
      onAddPhoto={addStaffPhoto}
      onDeletePhoto={deleteStaffPhoto}
    />
  );
}
