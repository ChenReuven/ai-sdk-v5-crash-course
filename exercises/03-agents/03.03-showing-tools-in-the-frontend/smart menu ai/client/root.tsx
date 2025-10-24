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
    }>
  >([]);

  const [showGallery, setShowGallery] = useState(true);

  // Fetch initial meals when component mounts and no messages exist
  useEffect(() => {
    const fetchInitialMeals = async () => {
      try {
        const mealPromises = Array.from({ length: 10 }, () =>
          fetch(
            'https://www.themealdb.com/api/json/v1/1/random.php',
          )
            .then((res) => res.json())
            .then((data) => ({
              meal: data.meals[0].strMeal,
              image: data.meals[0].strMealThumb,
            })),
        );

        const meals = await Promise.all(mealPromises);
        setInitialMeals(meals);
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
