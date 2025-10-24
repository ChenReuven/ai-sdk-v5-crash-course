import { useChat } from '@ai-sdk/react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { MyUIMessage } from '../api/chat.ts';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';

const App = () => {
  const { messages, sendMessage } = useChat<MyUIMessage>({});

  const [input, setInput] = useState(
    'תפתיע אותי עם מנה מהתפריט',
  );

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
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
        />
      ))}
      <ChatInput
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({
            text: input,
          });
          setInput('');
        }}
      />
    </Wrapper>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
