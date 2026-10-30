import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { strings } from '@/i18n';

/** Built in a later part of the UI phase. */
export default function DiaryScreen() {
  return (
    <PlaceholderScreen
      title={strings.placeholder.diaryTitle}
      body={strings.placeholder.diaryBody}
      icon="diary"
    />
  );
}
