import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { MyUIMessage } from '../api/chat.ts';

export const Wrapper = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className="flex flex-col w-full max-w-md py-24 mx-auto stretch"
      dir="rtl"
    >
      {props.children}
    </div>
  );
};

export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: MyUIMessage['parts'];
}) => {
  const prefix = role === 'user' ? 'User: ' : 'AI: ';

  const text = parts
    .map((part) => {
      if (part.type === 'text') {
        return part.text;
      }
      return '';
    })
    .join('');
  return (
    <div className="flex flex-col gap-2">
      <div className="prose prose-invert my-6 text-right">
        <ReactMarkdown>{prefix + text}</ReactMarkdown>
      </div>
      {parts.map((part, index) => {
        if (part.type === 'tool-getRandomMeal') {
          return (
            <div
              key={index}
              className="bg-blue-900/20 border border-blue-700 rounded p-3 text-sm text-right"
            >
              <div className="font-semibold text-blue-300 mb-1">
                📝 Get a random meal
              </div>
              <div className="text-blue-200">
                Meal: {part.output?.meal || 'Unknown'}
              </div>
              <div>
                <img
                  src={part.output?.image ?? 'Unknown'}
                  alt={part.output?.meal || 'Unknown'}
                  className="w-full h-auto"
                />
                {part.output?.video && (
                  <div className="mt-2">
                    <div className="font-semibold text-blue-300 mb-1">
                      🎥 וידאו הכנה:
                    </div>
                    <iframe
                      width="100%"
                      height="300"
                      src={
                        part.output.video.includes(
                          'youtube.com/watch',
                        )
                          ? part.output.video.replace(
                              'youtube.com/watch?v=',
                              'youtube.com/embed/',
                            )
                          : part.output.video.includes(
                                'youtu.be',
                              )
                            ? part.output.video.replace(
                                'youtu.be/',
                                'youtube.com/embed/',
                              )
                            : `https://www.youtube.com/embed/${part.output.video}`
                      }
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          );
        }
        if (part.type === 'tool-lookupMealById') {
          return (
            <div
              key={index}
              className="bg-green-900/20 border border-green-700 rounded p-3 text-sm"
            >
              <div className="font-semibold text-green-300 mb-1">
                📖 Lookup meal by ID
              </div>
              <div className="text-green-200">
                ID: {part.input?.id || 'Unknown'}
              </div>
            </div>
          );
        }
        if (part.type === 'tool-searchMealByName') {
          return (
            <div
              key={index}
              className="bg-yellow-900/20 border border-yellow-700 rounded p-3 text-sm"
            >
              <div className="font-semibold text-yellow-300 mb-1">
                📖 Search meal by name
              </div>
              <div className="text-yellow-200">
                Name: {part.input?.name || 'Unknown'}
              </div>
              <div className="text-yellow-200">
                Meals:{' '}
                {part.output?.meals
                  .map((meal) => meal.meal)
                  .join(', ') || 'Unknown'}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export const ChatInput = ({
  input,
  onChange,
  onSubmit,
  disabled,
}: {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}) => (
  <form onSubmit={onSubmit}>
    <input
      className={`fixed bottom-0 w-full max-w-md p-2 mb-8 border-2 border-zinc-700 rounded shadow-xl bg-gray-800 text-right ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      value={input}
      placeholder={
        disabled
          ? 'Please handle tool calls first...'
          : 'Say something...'
      }
      onChange={onChange}
      disabled={disabled}
      autoFocus
    />
  </form>
);
