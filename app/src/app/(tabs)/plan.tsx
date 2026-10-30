import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { strings } from '@/i18n';

/** Built in a later part of the UI phase. */
export default function PlanScreen() {
  return (
    <PlaceholderScreen
      title={strings.placeholder.planTitle}
      body={strings.placeholder.planBody}
      icon="plus"
    />
  );
}
