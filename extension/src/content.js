function getCodeContent() {
  // Específico para GitHub, pero podemos expandirlo para otros sitios
  const codeElement = document.querySelector('.blob-code-inner');
  return codeElement ? codeElement.textContent : '';
}

async function analyzeCode(code) {
  try {
    const response = await fetch('https://tu-api-endpoint.com/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    return await response.json();
  } catch (error) {
    console.error('Error analyzing code:', error);
    return { error: 'Failed to analyze code' };
  }
}

// Escuchar mensajes del popup o background script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'analyzeCode') {
    const code = getCodeContent();
    const analysis = await analyzeCode(code);
    sendResponse(analysis);
  }
  return true; // Indica que usaremos sendResponse asincrónicamente
});
