const API_ENDPOINT = 'https://bsv2zn5jsnunrghcenpmpczopm0mzpof.lambda-url.eu-west-3.on.aws/analyze';

function getCodeContent() {
  // Específico para GitHub, pero podemos expandirlo para otros sitios
  const codeElement = document.querySelector('.blob-code-inner');
  return codeElement ? codeElement.textContent : '';
}

async function analyzeCode(code) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error analyzing code:', error);
    return { error: 'Failed to analyze code' };
  }
}

// Escuchar mensajes del popup o background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeCode') {
    (async () => {
      try {
        const code = getCodeContent();

        if (!code) {
          console.log('No code found');
          sendResponse({ error: 'No code found on this page' });
          return;
        }

        const result = await analyzeCode(code);
        console.log('Analysis result:', result);
        sendResponse(result);
      } catch (error) {
        console.error('Error:', error);
        sendResponse({ error: 'Analysis failed: ' + error.message });
      }
    })();
    return true; // Mantener el canal de mensaje abierto
  }
});
