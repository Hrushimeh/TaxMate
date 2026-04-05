import React from 'react';

interface ChatSuggestionsProps {
  suggestions: string[];
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: (event: React.FormEvent, options?: any) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  handleInputChange,
  handleSendMessage: _handleSendMessage,
}) => {
  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as any);
    setTimeout(() => {
      document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-gray-600 font-semibold">Suggested Follow-ups:</p>
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(suggestions) ? suggestions : []).map((suggestion, index) => (
          <div key={index} className="relative group">
            <button
              onClick={() => handleSuggestionClick(suggestion)}
              className="
                px-3 py-1 
                bg-blue-50 
                text-blue-700 
                rounded-full 
                text-sm 
                max-w-[300px] 
                truncate 
                hover:bg-blue-100 
                transition-colors 
                duration-200 
                border 
                border-blue-200
                hover:shadow-sm
              "
            >
              {suggestion}
            </button>
            <div
              className="
              absolute 
              z-10 
              invisible 
              group-hover:visible 
              bg-white 
              border 
              border-gray-200 
              rounded-lg 
              shadow-lg 
              p-2 
              text-sm 
              max-w-xs 
              left-1/2 
              transform 
              -translate-x-1/2 
              top-full 
              mt-2
            "
            >
              {suggestion}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
