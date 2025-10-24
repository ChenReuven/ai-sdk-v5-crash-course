import { useChat } from '@ai-sdk/react';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { MyUIMessage } from '../api/chat.ts';
import {
  ChatInput,
  MealGallery,
  Message,
  Wrapper,
} from './components.tsx';
import './tailwind.css';

const App = () => {
  const { messages, sendMessage } = useChat<MyUIMessage>({});

  const [input, setInput] = useState(
    'תפתיע אותי עם מנה מהתפריט',
  );

  const [initialMeals, setInitialMeals] = useState<
    Array<{
      meal: string;
      image: string;
      category?: string;
    }>
  >([]);

  const [showGallery, setShowGallery] = useState(true);

  // Fetch initial meals when component mounts and no messages exist
  useEffect(() => {
    const fetchInitialMeals = async () => {
      try {
        // Define categories to get variety
        const categories = [
          'Beef',
          'Chicken',
          'Seafood',
          'Vegetarian',
          'Dessert',
          'Pasta',
          'Pork',
          'Lamb',
          'Breakfast',
          'Side',
        ];

        // Category translations to Hebrew
        const categoryTranslations: Record<string, string> = {
          Beef: 'בשר בקר',
          Chicken: 'עוף',
          Seafood: 'מאכלי ים',
          Vegetarian: 'צמחוני',
          Dessert: 'קינוח',
          Pasta: 'פסטה',
          Pork: 'חזיר',
          Lamb: 'כבש',
          Breakfast: 'ארוחת בוקר',
          Side: 'תוספת',
        };

        const mealPromises = categories.map((category) =>
          fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`,
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.meals && data.meals.length > 0) {
                // Get a random meal from this category
                const randomIndex = Math.floor(
                  Math.random() * data.meals.length,
                );
                const meal = data.meals[randomIndex];
                return {
                  meal: meal.strMeal,
                  image: meal.strMealThumb,
                  category:
                    categoryTranslations[category] || category,
                };
              }
              return null;
            })
            .catch(() => null),
        );

        const meals = await Promise.all(mealPromises);
        // Filter out any failed requests and limit to 10
        const validMeals = meals
          .filter((meal) => meal !== null)
          .slice(0, 10);
        setInitialMeals(validMeals);
      } catch (error) {
        console.error('Failed to fetch initial meals:', error);
      }
    };

    if (messages.length === 0) {
      fetchInitialMeals();
    }
  }, [messages.length]);

  const handleMealClick = (mealName: string) => {
    sendMessage({
      text: `ספר לי עוד על ${mealName}`,
    });
    setShowGallery(false);
  };

  const handleSkip = () => {
    setShowGallery(false);
  };

  return (
    <Wrapper>
      <div className="text-center mb-8" dir="rtl">
        <h1 className="text-4xl font-bold text-white mb-2">
          🍽️ Smart Menu AI
        </h1>
        <p className="text-lg text-gray-300">
          גלה את המנה המושלמת שלך עם המלצות מבוססות בינה מלאכותית
        </p>
      </div>

      {showGallery &&
        messages.length === 0 &&
        initialMeals.length > 0 && (
          <MealGallery
            meals={initialMeals}
            onMealClick={handleMealClick}
            onSkip={handleSkip}
          />
        )}

      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
        />
      ))}
      <ChatInput
        input={input}
        onChange={(e) => {
          setInput(e.target.value);
          // Hide gallery when user starts typing
          if (showGallery && e.target.value.trim()) {
            setShowGallery(false);
          }
        }}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({
            text: input,
          });
          setInput('');
          setShowGallery(false);
        }}
      />
    </Wrapper>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
