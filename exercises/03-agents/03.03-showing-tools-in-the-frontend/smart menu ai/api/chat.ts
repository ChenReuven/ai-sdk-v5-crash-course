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

export type SearchMealOutput = GetRandomMealOutput[];

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

  searchMealByName: tool({
    description: 'Search for meals by name from TheMealDB.',
    inputSchema: z.object({
      name: z.string().describe('The name of the meal to search for'),
    }),
    outputSchema: z.object({
      meals: z.array(z.object({
        meal: z.string().describe('The name of the meal'),
        instructions: z.string().describe('The instructions to make the meal'),
        ingredients: z.array(z.string()).describe('The ingredients to make the meal'),
        image: z.string().describe('The image of the meal'),
        video: z.string().describe('The video of the meal, if it exists'),
      })).describe('Array of matching meals'),
    }),
    execute: async ({ name }): Promise<{ meals: GetRandomMealOutput[] }> => {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
      const data = await response.json();
      
      if (!data.meals) {
        return { meals: [] };
      }
      
      const meals: GetRandomMealOutput[] = data.meals.map((meal: any) => {
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
      });
      
      return { meals };
    },
  }),

  lookupMealById: tool({
    description: 'Lookup full meal details by ID from TheMealDB.',
    inputSchema: z.object({
      id: z.string().describe('The ID of the meal to lookup'),
    }),
    outputSchema: z.object({
      meal: z.string().describe('The name of the meal'),
      instructions: z.string().describe('The instructions to make the meal'),
      ingredients: z.array(z.string()).describe('The ingredients to make the meal'),
      image: z.string().describe('The image of the meal'),
      video: z.string().describe('The video of the meal, if it exists'),
      category: z.string().describe('The category of the meal'),
      area: z.string().describe('The area/cuisine of the meal'),
      tags: z.string().describe('The tags of the meal'),
    }),
    execute: async ({ id }): Promise<{
      meal: string;
      instructions: string;
      ingredients: string[];
      image: string;
      video: string;
      category: string;
      area: string;
      tags: string;
    }> => {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`);
      const data = await response.json();
      
      if (!data.meals || data.meals.length === 0) {
        throw new Error(`Meal with ID ${id} not found`);
      }
      
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
        category: meal.strCategory,
        area: meal.strArea,
        tags: meal.strTags || '',
      };
    },
  }),

  filterMealsByIngredient: tool({
    description: 'Filter meals by main ingredient from TheMealDB.',
    inputSchema: z.object({
      ingredient: z.string().describe('The main ingredient to filter meals by (e.g., chicken_breast)'),
    }),
    outputSchema: z.object({
      meals: z.array(z.object({
        meal: z.string().describe('The name of the meal'),
        instructions: z.string().describe('The instructions to make the meal'),
        ingredients: z.array(z.string()).describe('The ingredients to make the meal'),
        image: z.string().describe('The image of the meal'),
        video: z.string().describe('The video of the meal, if it exists'),
        category: z.string().describe('The category of the meal'),
        area: z.string().describe('The area/cuisine of the meal'),
        tags: z.string().describe('The tags of the meal'),
      })).describe('Array of meals containing the specified ingredient'),
    }),
    execute: async ({ ingredient }): Promise<{ meals: Array<{
      meal: string;
      instructions: string;
      ingredients: string[];
      image: string;
      video: string;
      category: string;
      area: string;
      tags: string;
    }> }> => {
      // First, get the filtered list of meals
      const filterResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
      const filterData = await filterResponse.json();
      
      if (!filterData.meals || filterData.meals.length === 0) {
        return { meals: [] };
      }
      
      // Fetch full details for each meal using Promise.all for parallel requests
      const mealDetails = await Promise.all(
        filterData.meals.map(async (meal: any) => {
          const lookupResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
          const lookupData = await lookupResponse.json();
          
          if (!lookupData.meals || lookupData.meals.length === 0) {
            return null;
          }
          
          const fullMeal = lookupData.meals[0];
          
          // Extract ingredients from strIngredient1-20 properties
          const ingredients: string[] = [];
          for (let i = 1; i <= 20; i++) {
            const ingredient = fullMeal[`strIngredient${i}`];
            const measure = fullMeal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
              ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
            }
          }
          
          return {
            meal: fullMeal.strMeal,
            instructions: fullMeal.strInstructions,
            ingredients: ingredients,
            image: fullMeal.strMealThumb,
            video: fullMeal.strYoutube || '',
            category: fullMeal.strCategory,
            area: fullMeal.strArea,
            tags: fullMeal.strTags || '',
          };
        })
      );
      
      // Filter out any null results and return the meals
      return { meals: mealDetails.filter(meal => meal !== null) };
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
      - getRandomMeal: Get a random meal recipe
      - searchMealByName: Search for meals by name
      - lookupMealById: Get detailed information about a specific meal by its ID
      - filterMealsByIngredient: Filter meals by main ingredient (returns full details)

      When searchMealByName returns no results, suggest alternative meals or use getRandomMeal to recommend something similar.

      You MUST ANSWER ALL THE USER'S QUESTIONS IN HEBREW.

    `,
    tools,
    stopWhen: [stepCountIs(10)],
  });

  return result.toUIMessageStreamResponse();
};
