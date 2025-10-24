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

export type GetRandomMealOutput = {
  meal: string;
  instructions: string;
  ingredients: string[];
  image: string;
  video: string;
};

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
    outputSchema: z.object({
      meal: z.string().describe('The name of the meal'),
      instructions: z.string().describe('The instructions to make the meal'),
      ingredients: z.array(z.string()).describe('The ingredients to make the meal from strIngredients'),
      image: z.string().describe('The image of the meal from strMealThumb'),
      video: z.string().describe('The video of the meal from strYoutube, if it exists'),
    }),
    execute: async (): Promise<GetRandomMealOutput> => {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await response.json();
      const meal = data.meals[0];
      
      // Extract ingredients from strIngredient1-20 properties
      const ingredients: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
          ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
        }
      }
      
      return {
        meal: meal.strMeal,
        instructions: meal.strInstructions,
        ingredients: ingredients,
        image: meal.strMealThumb,
        video: meal.strYoutube || '',
      };
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
