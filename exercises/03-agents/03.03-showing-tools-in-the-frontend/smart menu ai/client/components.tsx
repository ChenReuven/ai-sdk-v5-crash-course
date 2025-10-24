import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { MyUIMessage } from '../api/chat.ts';

export const Wrapper = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
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
      <div className="prose prose-invert my-6">
        <ReactMarkdown>{prefix + text}</ReactMarkdown>
      </div>
      {parts.map((part, index) => {
        console.log(part);
        if (part.type === 'tool-getRandomMeal') {
          return (
            <div
              key={index}
              className="bg-blue-900/20 border border-blue-700 rounded p-3 text-sm"
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
                  className="w-1/2 h-auto"
                />
                {part.output?.video && (
                  <div className="mt-2">
                    <div className="font-semibold text-blue-300 mb-1">
                      🎥 וידאו הכנה:
                    </div>
                    <iframe
                      width="100%"
                      height="250"
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
      className={`fixed bottom-0 w-full max-w-md p-2 mb-8 border-2 border-zinc-700 rounded shadow-xl bg-gray-800 ${
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
