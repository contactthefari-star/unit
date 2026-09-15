import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cockpit surfaces (dark)
        deck: {
          bg: "#0A0D12",       // base background
          panel: "#12171F",    // cards / panels
          panel2: "#171D27",   // raised panel
          line: "#232B37",     // borders
          line2: "#2E3846",    // stronger borders
          ink: "#EAEEF5",      // primary text
          mute: "#8A94A6",     // secondary text
          faint: "#5A6474",    // tertiary text
        },
        // ADHD pole color system (from spec)
        pole: {
          delivery: "#10B981",   // Léhi — Delivery & Clients
          acquisition: "#3B82F6",// Andréa — Acquisition & Leads
          content: "#8B5CF6",    // Arthur — Contenu & Objections
          secretary: "#F59E0B",  // Jérémy — Secrétariat & Tâches
          alert: "#EF4444",      // Retard / replanification auto
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        deck: "0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 32px rgba(0,0,0,0.45)",
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.5)",
      },
      keyframes: {
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
        sweep: "sweep 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
