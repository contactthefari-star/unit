import { SupabaseProvider } from "@/components/shell/SupabaseContext";
import { CockpitProvider } from "@/components/shell/CockpitContext";
import { AppShell } from "@/components/shell/AppShell";

export default function Page() {
  return (
    <SupabaseProvider>
      <CockpitProvider>
        <AppShell />
      </CockpitProvider>
    </SupabaseProvider>
  );
}
