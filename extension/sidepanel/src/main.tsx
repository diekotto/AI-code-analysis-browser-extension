import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import SidepanelChat from './SidepanelChat.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SidepanelChat />
  </StrictMode>
);
