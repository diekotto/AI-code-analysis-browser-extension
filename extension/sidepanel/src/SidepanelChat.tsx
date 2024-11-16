import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Code, Terminal, HelpCircle } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

// Platform detection and code container finder utility
const PLATFORMS = {
  GITHUB: {
    name: 'GitHub',
    hostname: 'github.com',
    isCodePage: (pathname: string) => /\/blob\//.test(pathname),
    getCodeContainer: () => document.querySelector('.blob-wrapper'),
    getLanguage: () => {
      const langEl = document.querySelector('.blob-code');
      return langEl ? langEl.getAttribute('data-lang') : null;
    },
  },
  GITLAB: {
    name: 'GitLab',
    hostname: 'gitlab.com',
    isCodePage: (pathname: string) => /\/blob\//.test(pathname),
    getCodeContainer: () => document.querySelector('.blob-content'),
    getLanguage: () => {
      const langEl = document.querySelector('.js-syntax-highlight');
      return langEl ? langEl.getAttribute('data-syntax-highlight') : null;
    },
  },
  BITBUCKET: {
    name: 'Bitbucket',
    hostname: 'bitbucket.org',
    isCodePage: (pathname: string) => /\/src\//.test(pathname),
    getCodeContainer: () => document.querySelector('.file-source'),
    getLanguage: () => {
      const langEl = document.querySelector('.file-source');
      return langEl ? langEl.getAttribute('data-syntax-highlight') : null;
    },
  },
};

class CodePlatformDetector {
  public currentPlatform: any;
  constructor() {
    this.currentPlatform = null;
  }

  detectPlatform(url: string) {
    for (const [, platform] of Object.entries(PLATFORMS)) {
      if (url.includes(platform.hostname)) {
        this.currentPlatform = platform;
        return platform;
      }
    }
    return null;
  }

  getCodeContainer() {
    if (!this.currentPlatform) {
      throw new Error('Platform not detected');
    }

    if (!this.currentPlatform) {
      return null;
    }

    return this.currentPlatform.getCodeContainer();
  }

  // Helper method to get code content
  getCodeContent() {
    const container = this.getCodeContainer();
    if (!container) {
      return null;
    }

    // Get all code lines and join them
    const codeLines = Array.from(container.querySelectorAll('.blob-code-inner, .code-line'))
      .map((line: any) => line.textContent)
      .join('\n');

    return codeLines;
  }
}

export default function SidepanelChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [codePlatform, setCodePlatform] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const detector = new CodePlatformDetector();

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

  const updateCodePlatform = (url: string) => {
    const platform = detector.detectPlatform(url);
    setCodePlatform(platform ? platform.name : '');
  };

  const requestPageInfo = () => {
    chrome.runtime.sendMessage({ action: 'GET_PAGE_CODE', codePlatform }, (response) => {
      console.log('Response received:', response);
    });
  };

  useEffect(() => {
    console.log('Connecting to background...');
    const port = chrome.runtime.connect({ name: 'sidepanel' });
    port.onMessage.addListener((message: any) => {
      console.log('Message received:', message);
      updateCodePlatform(message.data.url);
    });
    return () => {
      port.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeCodeButton = (
    <Button onClick={requestPageInfo} className="rounded w-min bg-blue-800 hover:bg-blue-700 text-white">
      <Code className="mr-2 h-4 w-4" /> Analyze Code
    </Button>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-[rgb(17,24,39)] text-white">
      <div className="flex-none w-full justify-between items-center p-4 bg-[rgb(31,41,55,0.5)]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-400">AI Code Assistant</h2>
          <span className="inline-flex items-center gap-2 font-medium text-blue-600">
            <Terminal size={18} />
            {codePlatform || <HelpCircle className="text-purple-500" />}
          </span>
        </div>
      </div>

      {/* Scrollable Message Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4 min-h-full">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded max-w-[80%] p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-700' : 'bg-[rgb(31,41,55,0.5)]'}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {analyzeCodeButton}
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
            className="rounded flex-grow bg-[rgb(17,24,39)] text-white border-blue-900 focus:border-blue-700"
          />
          <Button type="submit" className="rounded bg-blue-700 hover:bg-blue-600">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
