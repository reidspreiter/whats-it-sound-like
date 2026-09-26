const PREFERENCES_KEY = "preferences";

export type NavigationStyle = "pan-on-drag" | "pan-on-scroll";

export interface Preferences {
  cableOpacity: number;
  cableTension: number;
  navigationStyle: NavigationStyle;
  showKeybindHints: boolean;
}

export const preferences = $state<Preferences>({
  cableOpacity: 0.75,
  cableTension: 0.5,
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
