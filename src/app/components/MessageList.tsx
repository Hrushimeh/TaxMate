import React, { RefObject } from 'react';

interface MessageListProps {
  messages: any[];
  messagesEndRef: RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex flex-col w-full h-150 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-start' : 'justify-end'
          } mb-2`}
        >
          <div
            className={`relative px-5 py-5 max-w-md rounded-lg shadow-md ${
              message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-900'
            }`}
          >
            <span className="font-medium">{message.role === 'user' ? 'You: ' : 'AI: '}</span>
            {(Array.isArray(message.parts) ? message.parts : []).map((part: any, i: number) => (
              <div key={`${message.id}-${i}`}>{part.type === 'text' && part.text}</div>
            ))}
            <div
              className={`absolute w-0 h-0 border-solid border-t-8 border-r-8 border-transparent ${
                message.role === 'user'
                  ? 'left-2 border-t-blue-500'
                  : 'right-2 border-t-gray-300'
              }`}
            />
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
