"use client";

import { useVoiceInput } from "@/hooks/useVoiceInput";
import { IconMic } from "@/components/ui/Icons";

/**
 * Bouton micro à coller à côté d'un champ texte.
 * `onText` reçoit la phrase dictée — au closer de l'écrire dans son state.
 * Se masque tout seul si le navigateur ne gère pas la dictée.
 */
export function VoiceButton({
  onText,
  title = "Dicter",
  className = "",
}: {
  onText: (text: string) => void;
  title?: string;
  className?: string;
}) {
  const { supported, listening, toggle } = useVoiceInput(onText);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? "J'écoute… clique pour arrêter" : title}
      aria-label={title}
      aria-pressed={listening}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition ${
        listening
          ? "border-pole-alert bg-pole-alert/15 text-pole-alert animate-pulseSoft"
          : "border-deck-line bg-deck-panel2 text-deck-mute hover:text-deck-ink hover:border-deck-line2"
      } ${className}`}
    >
      <IconMic width={17} height={17} />
    </button>
  );
}
