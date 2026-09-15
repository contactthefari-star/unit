import { SmartSecretary } from "@/components/dashboard/SmartSecretary";
import { NotionSync } from "@/components/dashboard/NotionSync";

export function UnitView() {
  return (
    <div className="space-y-4">
      <SmartSecretary />
      <NotionSync />
    </div>
  );
}
