import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type InferUITools,
  type UIMessage
} from 'ai';
import { z } from 'zod';

export type MyUIMessage = UIMessage<
  never,
  never,
  InferUITools<typeof tools>
>;

/** Meal recommendation tool */
const tools = {
  getRandomMeal: tool({
    description: 'Get a random meal recipe from TheMealDB.',
    inputSchema: z.object({}),
    execute: async () => {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await response.json();
      return data.meals[0];
    },
  }),

};

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: convertToModelMessages(messages),
    system: `
      You are  menu assistant like a waiter that helps the user to choose a meal from the menu. 
      You can recommend random meal recipes from TheMealDB.

      Use these tools to assist the user to choose a meal from the menu:
      - getRandomMeal

      You MUST ANSWER ALL THE USER'S QUESTIONS IN HEBREW.

    `,
    tools,
    stopWhen: [stepCountIs(10)],
  });

  return result.toUIMessageStreamResponse();
};
