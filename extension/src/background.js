// Manejar la instalación
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // Configurar el side panel por defecto
  chrome.sidePanel.setOptions({
    enabled: true
  });
});

// Manejar los mensajes
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'openSidebar') {
    try {
      // Obtener la pestaña activa
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        console.error('No active tab found');
        return;
      }

      // Configurar y abrir el side panel
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: 'sidepanel.html',
        enabled: true
      });
      
      // Abrir el panel
      await chrome.sidePanel.open({ tabId: tab.id });
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error opening sidebar:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});
