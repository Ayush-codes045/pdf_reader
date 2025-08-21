'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';


interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
      lines?: { from: number; to: number };
    };
    source?: string;
    pdf?: {
      info?: {
        totalPages?: number;
      };
    };
  };
  source?: string;
}
interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(message)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data?.message,
          documents: data?.docs,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-16 text-lg font-medium">
            Start a conversation by asking questions about your uploaded PDF!
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
            <div className={`relative max-w-[80%] rounded-2xl shadow-lg p-5 transition-all ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none ml-auto'
                : 'bg-white text-gray-900 rounded-bl-none mr-auto border border-blue-100'
            }`}>
              {/* Message Content */}
              <div className="whitespace-pre-wrap text-base leading-relaxed"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
              {/* Source Documents (accordion, only for assistant, only if valid page number) */}
              {msg.role === 'assistant' && Array.isArray(msg.documents) && msg.documents.filter(doc => doc.metadata?.loc?.pageNumber).length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2 font-semibold">📄 Sources:</div>
                  <div className="space-y-2">
                    {msg.documents.filter(doc => doc.metadata?.loc?.pageNumber).map((doc, docIndex) => {
                      const pageNumber = doc.metadata?.loc?.pageNumber;
                      const lines = doc.metadata?.loc?.lines;
                      const totalPages = doc.metadata?.pdf?.info?.totalPages;
                      const rawSourceLink = doc.source || doc.metadata?.source;
                      // Extract just the filename for the download link
                      const filename = rawSourceLink ? rawSourceLink.split('/').pop() : undefined;
                      const isOpen = openAccordion === `${index}-${docIndex}`;
                      return (
                        <div key={docIndex} className="rounded border border-blue-200 bg-blue-50">
                          <button
                            className="w-full flex items-center justify-between px-4 py-2 text-left focus:outline-none hover:bg-blue-100 transition"
                            onClick={() => setOpenAccordion(isOpen ? null : `${index}-${docIndex}`)}
                            type="button"
                          >
                            <span className="font-medium text-blue-700">
                              Page {pageNumber}
                              {lines && (
                                <span className="ml-2 text-xs text-blue-500">(lines {lines.from}-{lines.to})</span>
                              )}
                              {totalPages && (
                                <span className="ml-2 text-xs text-blue-400">/ {totalPages} pages</span>
                              )}
                            </span>
                            <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 pt-2 text-sm text-blue-900">
                              <div className="mb-2">
                                <span className="font-semibold">Snippet:</span> {doc.pageContent?.substring(0, 350)}...
                              </div>
                              {filename && userId && (
                                <a
                                  href={`http://localhost:8000/uploads/${userId}/${filename}`}
                                  download
                                  className="inline-block mt-1 text-blue-600 hover:underline text-xs font-medium bg-blue-100 px-2 py-1 rounded"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  ⬇️ Download Source PDF
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-2xl shadow p-5 border border-blue-100">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div className="border-t bg-white/80 p-4 shadow-inner">
        <div className="flex gap-3 items-center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1 border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2 text-base shadow-sm bg-white/90"
          />
          <Button 
            onClick={handleSendChatMessage} 
            disabled={!message.trim() || isLoading}
            className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;