const PREFERENCES_KEY = "preferences";

export type NavigationStyle = "pan-on-drag" | "pan-on-scroll";

export type KnobRotationStyle = "absolute-rotary" | "linear" | "linear-ptr-lock";

export interface Preferences {
  cableOpacity: number;
  cableTension: number;
  knobRotationStyle: KnobRotationStyle;
  navigationStyle: NavigationStyle;
  showKeybindHints: boolean;
}

export const preferences = $state<Preferences>({
  cableOpacity: 0.75,
  cableTension: 0.5,
  knobRotationStyle: "linear-ptr-lock",
  navigationStyle: "pan-on-drag",
  showKeybindHints: true,
});

$effect.root(() => {
  const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
  if (savedPreferences !== null) {
    Object.assign(preferences, JSON.parse(savedPreferences));
  }

  $effect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  });
});
