import { router } from 'expo-router';

import { useProfileStore } from '@/data/stores/profile';
import { useRemindersStore } from '@/data/stores/reminders';
import { CharacterPicker } from '@/features/characters/CharacterPicker';
import { characterVoice } from '@/features/mascot/useCharacter';
import { format, strings } from '@/i18n';
import { showToast } from '@/lib/toast';
import { scheduleMealReminders } from '@/services/reminders';
import { activeTheme } from '@/theme';

/**
 * Profiili → Hahmo ja teema. Choosing re-themes the whole app at once (the
 * root layout remounts the navigator and keeps the user on this screen).
 */
export default function ChooseCharacterScreen() {
  const current = useProfileStore((s) => s.characterId);
  const update = useProfileStore((s) => s.update);
  return (
    <CharacterPicker
      initial={current}
      current={current}
      mode={activeTheme()}
      onBack={() => router.back()}
      onChoose={(id) => {
        update({ characterId: id, characterChosen: true });
        showToast(format(strings.characters.changed, { name: characterVoice(id).name }));
        // Reminders speak in the character's voice: reschedule them with the new texts.
        const reminders = useRemindersStore.getState();
        if (reminders.enabled) void scheduleMealReminders(true, reminders.times);
      }}
    />
  );
}
