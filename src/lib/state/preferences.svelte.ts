const PREFERENCES_KEY = "preferences";

export interface Preferences {
  cableOpacity: number;
  cableTension: number;
  showKeybindHints: boolean;
}

export const preferences = $state<Preferences>({
  cableOpacity: 0.75,
  cableTension: 0.5,
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
