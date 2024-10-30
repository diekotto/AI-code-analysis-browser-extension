import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Eraser } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([{ text: 'Hola, ¿en qué puedo ayudarte hoy?.', isBot: true }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isBot: false }]);
      setInput('');
      // Aquí iría la lógica para procesar la entrada del usuario y generar una respuesta del bot
      setTimeout(() => {
        setMessages((msgs) => [...msgs, { text: 'Gracias por tu mensaje. ¿Puedo ayudarte en algo más?', isBot: true }]);
      }, 1000);
    }
  };

  const handleClearChat = () => {
    setMessages([{ text: "Chat limpiado. ¿En qué puedo ayudarte?", isBot: true }])
  }

  return (
    <div className="w-96 h-[600px] bg-gray-100 shadow-lg flex flex-col">
      <div className="bg-gray-800 text-gray-100 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Code Assistant</h2>
        <Button
          onClick={handleClearChat}
          variant="ghost"
          size="icon"
          className="text-gray-100 hover:text-gray-300"
        >
          <Eraser className="w-5 h-5" />
          <span className="sr-only">Limpiar chat</span>
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`p-2 max-w-[80%] ${
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
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 bg-gray-200">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-grow bg-white text-gray-800 placeholder-gray-400"
          />
          <Button onClick={handleSend} className="bg-orange-400 hover:bg-orange-500 text-white">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
