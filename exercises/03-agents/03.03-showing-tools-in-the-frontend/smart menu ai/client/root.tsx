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
