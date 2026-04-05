import React from 'react';

interface ChatInputProps {
  input: string;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadClick: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: (event: React.FormEvent, options?: any) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  loading,
  fileInputRef,
  handleInputChange,
  handleUploadClick,
  handleFileChange,
  handleSendMessage,
}) => {
  return (
    <form
      onSubmit={handleSendMessage}
      className="flex items-center w-full mt-4 gap-3 border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-200"
    >
      <input
        className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white"
        value={input}
        disabled={loading}
        placeholder={loading ? "AI is responding..." : "Type a message..."}
        onChange={handleInputChange}
      />
      <input
        type="file"
        multiple
        accept="image/*,text/*,application/pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleUploadClick}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
      >
        Upload
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
