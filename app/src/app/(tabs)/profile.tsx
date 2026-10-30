import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { strings } from '@/i18n';

/** Built in a later part of the UI phase. */
export default function ProfileScreen() {
  return (
    <PlaceholderScreen
      title={strings.placeholder.profileTitle}
      body={strings.placeholder.profileBody}
      icon="profile"
    />
  );
}
