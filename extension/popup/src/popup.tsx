import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar, Code, Swords } from 'lucide-react';

declare const chrome: any;

export default function Popup() {
  const handleOpenSidebar = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' });
    });
  };

  const handleAnalyzeCode = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeCode' });
    });
  };

  const handleCodewarCode = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'codewarCode' });
    });
  };

  return (
    <Card className="w-80 bg-[rgb(31,41,55,0.5)] text-white border-blue-900 overflow-hidden">
      <CardHeader className="pb-4 bg-[rgb(17,24,39)]">
        <CardTitle className="text-2xl font-bold text-center text-blue-400">AI Code Assistant</CardTitle>
        <CardDescription className="text-center text-blue-200">Your intelligent coding companion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <Button onClick={handleOpenSidebar} className="w-full bg-blue-700 hover:bg-blue-600 text-white">
          <Sidebar className="mr-2 h-4 w-4" /> Open Sidebar
        </Button>
        <Button onClick={handleAnalyzeCode} className="w-full bg-blue-800 hover:bg-blue-700 text-white">
          <Code className="mr-2 h-4 w-4" /> Analyze Code
        </Button>
        <Button onClick={handleCodewarCode} className="w-full bg-blue-900 hover:bg-blue-800 text-white">
          <Swords className="mr-2 h-4 w-4" /> Codewar the Code
        </Button>
      </CardContent>
    </Card>
  );
}
