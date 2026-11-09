import { testAnswer, type AssistantContext } from '@/domain/assistantRules';
import type { CharacterId } from '@/theme/characters';

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = { id: string; role: ChatRole; text: string; createdAt: string };

/**
 * The assistant chat ("Kysy Nupulta" etc.). Screens depend only on this
 * interface. The real implementation calls the `assistant-chat` Edge
 * Function (Claude, the chosen character's persona, safety rules, daily limit; see
 * docs/GENERATION.md). `context` is today's diary and goals, sent only with
 * the user's consent; null otherwise. `character` picks the persona: only
 * the tone changes, the safety rules are the same for every character.
 */
export interface AssistantService {
  reply(input: { messages: readonly ChatMessage[]; context: AssistantContext; character: CharacterId }): Promise<string>;
}

const TEST_LATENCY_MS = 900;

const testAssistant: AssistantService = {
  reply: ({ messages, context }) =>
    new Promise((resolve) => {
      const last = [...messages].reverse().find((m) => m.role === 'user');
      setTimeout(() => resolve(testAnswer(last?.text ?? '', context)), TEST_LATENCY_MS);
    }),
};

/** The active implementation. Swap for the backend one without touching screens. */
export const assistant: AssistantService = testAssistant;
