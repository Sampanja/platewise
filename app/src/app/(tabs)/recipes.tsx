import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { strings } from '@/i18n';

/** Built in a later part of the UI phase. */
export default function RecipesScreen() {
  return (
    <PlaceholderScreen
      title={strings.placeholder.recipesTitle}
      body={strings.placeholder.recipesBody}
      icon="recipes"
    />
  );
}
