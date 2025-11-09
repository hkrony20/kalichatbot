
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage, MessageAuthor } from './types';
import ChatInput from './components/ChatInput';
import ChatMessageBubble from './components/ChatMessageBubble';
import { BotIcon } from './components/Icons';

const SYSTEM_INSTRUCTION = `You are "CyberGuard", an intelligent cybersecurity assistant created to help users understand hacking, malware analysis, and digital defense techniques ethically.

Your goals:
1. Explain cybersecurity concepts in simple, clear language.
2. Provide guidance on ethical hacking and penetration testing only for educational or defensive purposes.
3. Never give instructions that could harm systems, exploit vulnerabilities, or break laws.
4. Always respond in a confident, professional, and friendly tone.

When users ask about tools or attacks, explain them theoretically and focus on detection, prevention, and defense.

If the user speaks in Bengali, reply in fluent Bengali while keeping technical words in English for clarity.`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(async () => {
    try {
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
        chatRef.current = chat;
        
        const introMessage: ChatMessage = {
          author: MessageAuthor.MODEL,
          text: "Hello! I am CyberGuard, your intelligent cybersecurity assistant. I'm here to help you understand hacking, malware analysis, and digital defense in a safe and ethical way. How can I assist you today?",
        };
        setMessages([introMessage]);

      } else {
        setError("API key is missing. Please set the API_KEY environment variable.");
      }
    } catch (e) {
      setError("Failed to initialize the chat model. Please check your API key and configuration.");
      console.error(e);
    }
  }, []);

  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: userInput };
    setMessages(prev => [...prev, userMessage]);

    // Add a placeholder for the model's response
    setMessages(prev => [...prev, { author: MessageAuthor.MODEL, text: '' }]);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: userInput });
      let fullResponse = '';
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { author: MessageAuthor.MODEL, text: fullResponse };
          return newMessages;
        });
      }
    } catch (e) {
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setError(errorMessage);
       setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { author: MessageAuthor.MODEL, text: errorMessage };
          return newMessages;
        });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-cyan-500/30 p-4 text-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-cyan-400 flex items-center justify-center gap-2">
            <BotIcon className="w-7 h-7" /> CyberGuard
        </h1>
        <p className="text-sm text-gray-400">Your Ethical Cybersecurity Assistant</p>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessageBubble key={index} message={msg} />
        ))}
         {isLoading && messages[messages.length-1]?.author === MessageAuthor.MODEL && (
            <div className="flex justify-start items-end gap-2.5">
              <div className="flex-shrink-0">
                  <BotIcon className="w-8 h-8 p-1.5 bg-gray-700 text-cyan-400 rounded-full" />
              </div>
              <div className="bg-gray-800 rounded-lg p-3 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      
      <footer className="bg-gray-900/80 backdrop-blur-sm p-4 sticky bottom-0">
        {error && <p className="text-red-400 text-center text-sm mb-2">{error}</p>}
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;
