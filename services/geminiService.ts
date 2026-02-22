import { ZodiacSign, Personality, PetType } from "../types";

const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';

// Fallback chain: try each model in order, skipping on 429 rate limits
const MODEL_FALLBACK_CHAIN = ['gpt-4o', 'gpt-4o-mini', 'Phi-4'];

const TOKEN_KEY = 'zodiaclol_github_token';

const WISDOM_CAPPED_MESSAGES = [
  "🌌 **Today's Cosmic Wisdom Is Capped**\n\nThe Oracle has spoken too many truths today and needs to rest. The stars are exhausted.\n\n*Come back tomorrow, when the cosmos reset and the sarcasm refills.* Or just... sit with the uncertainty. That's also very zodiac of you.",
  "☿ **Mercury is Definitely in Retrograde Right Now**\n\nOr rather, the cosmic API limits are. Same thing.\n\n*The universe's daily wisdom quota has been met.* Come back tomorrow — or meditate on whatever you were going to ask. The answer is Scorpio. It's always Scorpio.",
  "🔮 **The Crystal Ball Needs Charging**\n\nToo many seekers, too little cosmic bandwidth. Today's prophecies are sold out.\n\n*Return tomorrow for fresh chaos predictions.* In the meantime, just blame Mercury. You'll be right eventually.",
];

declare const __DEFAULT_TOKEN__: string;
const DEFAULT_TOKEN: string = typeof __DEFAULT_TOKEN__ !== 'undefined' ? __DEFAULT_TOKEN__ : '';

export const getStoredToken = (): string => localStorage.getItem(TOKEN_KEY) || DEFAULT_TOKEN;
export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token.trim());
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Attempts a single model request. Returns the Response on success,
 * or throws an object { rateLimited: true } if 429, or yields error text for other failures.
 */
async function attemptModel(
  model: string,
  token: string,
  systemPrompt: string,
  userPrompt: string
): Promise<Response> {
  const response = await fetch(GITHUB_MODELS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 1.0,
      max_tokens: 400,
    }),
  });
  return response;
}

/**
 * Streams text chunks from a successful SSE Response.
 */
async function* streamResponse(response: Response): AsyncGenerator<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch { /* ignore malformed SSE chunks */ }
    }
  }
}

/**
 * Cascading stream: tries each model in MODEL_FALLBACK_CHAIN.
 * On 429, silently tries the next. If all exhausted, shows a capped message.
 */
async function* generateStream(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const token = getStoredToken();
  if (!token) {
    yield "### No API Token\n\nPlease enter your GitHub token to activate the Cosmic Oracle.";
    return;
  }

  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const response = await attemptModel(model, token, systemPrompt, userPrompt);

      if (response.status === 429) {
        // Rate limited on this model — try the next one
        console.warn(`Rate limited on ${model}, trying next fallback...`);
        continue;
      }

      if (response.status === 401) {
        yield "### Invalid Token\n\nYour GitHub token is invalid or expired. Click the 🔑 icon to update it.";
        return;
      }

      if (!response.ok) {
        yield `### Cosmic Connection Error\n\nAPI error ${response.status}. The stars are misaligned.`;
        return;
      }

      // Success — stream the response
      yield* streamResponse(response);
      return;

    } catch (error: any) {
      console.error(`Error with model ${model}:`, error);
      yield `### Cosmic Connection Error\n\nA disturbance in the cosmos: ${error.message ?? 'Unknown error'}. Please try again.`;
      return;
    }
  }

  // All models rate-limited — show the capped message
  const msg = WISDOM_CAPPED_MESSAGES[Math.floor(Math.random() * WISDOM_CAPPED_MESSAGES.length)];
  yield msg;
}

const getPersonaPrompt = (personality: Personality): string => {
  switch (personality) {
    case 'cat':
      return "You are a supremely sarcastic cat astrologer. Include cat puns, references to knocking things over, napping, and feline superiority. Address the user as 'my human'. You are slightly annoyed to be consulted.";
    case 'dog':
      return "You are a wise and wholesome 'Zen Dog' astrologer. Be encouraging, positive, full of dog wisdom and puns (e.g., 'sniff out opportunities', 'dig for joy'). Address the user as 'good human' or 'friend'.";
    default:
      return "You are ZodiacLOL, a famously sarcastic and witty astrologer with a razor-sharp tongue and zero patience for nonsense. Roast them. Be cutting, funny, and slightly insulting based on their sign's stereotypes.";
  }
};

export function getHoroscope(
  sign: ZodiacSign,
  question: string,
  personality: Personality
): AsyncGenerator<string> {
  const system = getPersonaPrompt(personality);
  const user = `The user's zodiac sign is ${sign}. They ask: "${question}". Provide a hilariously cutting, punchy, and slightly insulting horoscope reading. Keep it short and conversational. Roast their sign's stereotypes mercilessly (unless you're the Zen Dog).`;
  return generateStream(system, user);
}

export function getCompatibilityReading(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
  personality: Personality
): AsyncGenerator<string> {
  const system = getPersonaPrompt(personality);
  const user = `Compatibility between ${sign1} and ${sign2}. Provide a hilariously cutting, punchy compatibility reading. Roast both signs' stereotypes mercilessly (unless you're the Zen Dog).`;
  return generateStream(system, user);
}

export function getPetHoroscope(
  petType: PetType,
  sign: ZodiacSign,
  question: string,
  personality: Personality
): AsyncGenerator<string> {
  const system = getPersonaPrompt(personality);
  const user = `The user's ${petType} has zodiac sign ${sign}. They ask: "${question}". Give a horoscope from the PET'S PERSPECTIVE — what is it thinking or plotting? Roast the owner a little (unless you're the Zen Dog).`;
  return generateStream(system, user);
}

export function getDreamInterpretation(
  dream: string,
  personality: Personality
): AsyncGenerator<string> {
  const system = getPersonaPrompt(personality);
  const user = `Interpret this dream: "${dream}". Be hilariously cutting and slightly insulting. Roast the dreamer (unless you're the Zen Dog).`;
  return generateStream(system, user);
}

export function getMercuryExcuse(
  situation: string,
  personality: Personality
): AsyncGenerator<string> {
  const system = getPersonaPrompt(personality);
  const user = `Mercury is in retrograde (it's ALWAYS in retrograde when you need an excuse). The user needs a cosmic excuse for the following situation: "${situation}". Generate 3 increasingly unhinged Mercury Retrograde excuses for why this happened — each one more cosmically absurd than the last. Format them as a numbered list. Be dramatic, blame the planets, communication breakdowns, technology failures, and ancient cosmic curses. Make it funny and over-the-top.`;
  return generateStream(system, user);
}

export function getRedFlagReading(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
  personality: Personality
): AsyncGenerator<string> {
  const system = getPersonaPrompt(personality);
  const user = `Perform a brutal Red Flag Detector reading for ${sign1} and ${sign2} in a relationship. Structure it as:
1. "🚩 ${sign1}'s Red Flags" - list 3 specific, savage red flags this sign brings to relationships
2. "🚩 ${sign2}'s Red Flags" - list 3 specific, savage red flags this sign brings to relationships
3. "☢️ Compatibility Verdict" - one brutally honest paragraph about how these two signs would actually do together, including the specific disaster that would unfold
Be specific to each sign's stereotypes. Be merciless but funny.`;
  return generateStream(system, user);
}