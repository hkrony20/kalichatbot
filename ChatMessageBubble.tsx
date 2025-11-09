
import React from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { UserIcon, BotIcon } from './Icons';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;

  if (!message.text.trim() && message.author === MessageAuthor.MODEL) {
    return null;
  }

  const renderText = (text: string) => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lang = part.split('\n')[0].trim();
        const code = part.substring(lang.length).trim();
        return (
          <div key={index} className="bg-gray-900 rounded-md my-2">
            <div className="text-xs text-gray-400 px-4 py-1 border-b border-gray-700">{lang || 'code'}</div>
            <pre className="p-4 text-sm text-white overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      // Simple markdown for bold and italics
      let formattedPart = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedPart = formattedPart.replace(/\*(.*?)\*/g, '<em>$1</em>');
      return <span key={index} dangerouslySetInnerHTML={{ __html: formattedPart.replace(/\n/g, '<br />') }} />;
    });
  };

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <BotIcon className="w-8 h-8 p-1.5 bg-gray-700 text-cyan-400 rounded-full" />
        </div>
      )}
      <div
        className={`flex flex-col max-w-xl w-full p-3 rounded-lg ${
          isUser
            ? 'bg-cyan-600 text-white rounded-br-none'
            : 'bg-gray-800 text-gray-200 rounded-bl-none'
        }`}
      >
        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-strong:text-cyan-400">
           {renderText(message.text)}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0">
          <UserIcon className="w-8 h-8 p-1.5 bg-gray-700 text-gray-300 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;
