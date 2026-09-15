import { CockpitProvider } from "@/components/shell/CockpitContext";
import { AppShell } from "@/components/shell/AppShell";

export default function Page() {
  return (
    <CockpitProvider>
      <AppShell />
    </CockpitProvider>
  );
}
