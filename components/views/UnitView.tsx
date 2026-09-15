import { SmartSecretary } from "@/components/dashboard/SmartSecretary";
import { ScheduledAlerts } from "@/components/dashboard/ScheduledAlerts";
import { NotionSync } from "@/components/dashboard/NotionSync";

export function UnitView() {
  return (
    <div className="space-y-4">
      <SmartSecretary />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScheduledAlerts />
        <NotionSync />
      </div>
    </div>
  );
}
