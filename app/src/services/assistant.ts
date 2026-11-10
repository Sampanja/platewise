import { suggestRecipes, testAnswer, type AssistantContext, type RecipeHint } from '@/domain/assistantRules';
import type { CharacterId } from '@/theme/characters';

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  /** Recipes the assistant suggested, shown as tappable cards. */
  recipeIds?: string[];
};

export type AssistantReply = { text: string; recipeIds: string[] };

/**
 * The assistant chat ("Kysy Nupulta" etc.). Screens depend only on this
 * interface. The real implementation calls the `assistant-chat` Edge
 * Function (Claude, the chosen character's persona, safety rules, daily limit; see
 * docs/GENERATION.md). `context` is today's diary and goals, sent only with
 * the user's consent; null otherwise. `character` picks the persona: only
 * the tone changes, the safety rules are the same for every character.
 * `recipes` are the recipes the user may see (isRecipeAllowed): the assistant
 * suggests only from them, and the backend repeats the same gate.
 */
export interface AssistantService {
  reply(input: {
    messages: readonly ChatMessage[];
    context: AssistantContext;
    character: CharacterId;
    recipes: readonly RecipeHint[];
  }): Promise<AssistantReply>;
}

const TEST_LATENCY_MS = 900;

const testAssistant: AssistantService = {
  reply: ({ messages, context, recipes }) =>
    new Promise((resolve) => {
      const question = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
      const reply = {
        text: testAnswer(question, context, recipes),
        recipeIds: suggestRecipes(question, recipes).map((r) => r.id),
      };
      setTimeout(() => resolve(reply), TEST_LATENCY_MS);
    }),
};

/** The active implementation. Swap for the backend one without touching screens. */
export const assistant: AssistantService = testAssistant;
