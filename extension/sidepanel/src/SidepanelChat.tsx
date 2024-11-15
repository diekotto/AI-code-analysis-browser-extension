import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export default function SidepanelChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: "I'm processing your request. Please wait.", sender: 'ai' }]);
      }, 1000);
    }
  };

  const handleClose = () => {
    // Send message to content script to close sidebar
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
    //   chrome.tabs.sendMessage(tabs[0].id, { action: 'closeSidebar' });
    // });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-full bg-[rgb(17,24,39)] text-white">
      <div className="flex-none w-full justify-between items-center p-4 bg-[rgb(31,41,55,0.5)]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-400">AI Code Assistant</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-blue-400 hover:text-blue-300">
            <X className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Message Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4 min-h-full">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">No messages yet. Start a conversation!</div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-700' : 'bg-[rgb(31,41,55,0.5)]'}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="flex-none w-full p-4 bg-[rgb(31,41,55,0.5)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow bg-[rgb(17,24,39)] text-white border-blue-900 focus:border-blue-700"
          />
          <Button type="submit" className="bg-blue-700 hover:bg-blue-600">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
