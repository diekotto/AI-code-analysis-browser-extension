import ReactMarkdown from 'react-markdown';
import { useRef, useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Eraser, Copy, Check } from 'lucide-react';
import { Textarea } from './components/ui/textarea';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
};

const Message = ({ message }: { message: { text: string; isBot: boolean } }) => {
  return (
    <div className={`mb-4 flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`relative p-2 max-w-[85%] rounded-lg ${
          message.isBot ? 'bg-gray-200 text-gray-800' : 'bg-orange-200 text-gray-800'
        }`}
      >
        <div className="flex items-center mb-1">
          {message.isBot ? (
            <Bot className="w-4 h-4 mr-2 text-gray-600" />
          ) : (
            <User className="w-4 h-4 mr-2 text-gray-600" />
          )}
          <span className="font-semibold text-sm">{message.isBot ? 'Bot' : 'Tú'}</span>
        </div>
        <div className="text-sm prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');

                const isInline = !match && !code.includes('\n');

                if (!isInline && match) {
                  return (
                    <div className="relative group">
                      <SyntaxHighlighter
                        {...props}
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md !mt-2 !mb-2"
                      >
                        {code}
                      </SyntaxHighlighter>
                      <CopyButton code={code} />
                    </div>
                  );
                }
                return (
                  <code className="px-1 py-0.5 rounded-md bg-gray-800 text-gray-100" {...props}>
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      text: 'Hola, ¿en qué puedo ayudarte hoy? Puedo mostrarte algunos ejemplos de código como este:\n\n```javascript\nconst greeting = "Hola Mundo!";\nconsole.log(greeting);\n```',
      isBot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isBot: false }]);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          {
            text: 'Aquí tienes un ejemplo de código en Python:\n\n```python\ndef saludar(nombre):\n    return f"¡Hola {nombre}!"\n\nprint(saludar("Usuario"))\n```\n\n¿Necesitas algo más?',
            isBot: true,
          },
        ]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        text: "Chat limpiado. ¿En qué puedo ayudarte? Aquí tienes un ejemplo de código:\n\n```javascript\nconsole.log('¡Chat reiniciado!');\n```",
        isBot: true,
      },
    ]);
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setInput(textarea.value);
  };

  return (
    <div className="w-96 h-[600px] bg-gray-100 shadow-lg flex flex-col">
      <div className="bg-gray-800 text-gray-100 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Code Assistant</h2>
        <Button onClick={handleClearChat} variant="ghost" size="icon" className="text-gray-100 hover:text-gray-300">
          <Eraser className="w-5 h-5" />
          <span className="sr-only">Limpiar chat</span>
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4 bg-gray-50">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </ScrollArea>
      <div className="p-4 bg-gray-200">
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={adjustTextareaHeight}
            onKeyDown={handleKeyPress}
            className="flex-grow bg-white text-gray-800 placeholder-gray-400 min-h-[40px] max-h-[160px] resize-none"
            rows={1}
          />
          <Button onClick={handleSend} className="bg-orange-400 hover:bg-orange-500 text-white self-end h-10">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-1 text-xs text-gray-500">Presiona Control + Enter para enviar.</div>
      </div>
    </div>
  );
}
