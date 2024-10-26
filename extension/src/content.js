const API_ENDPOINT = 'https://bsv2zn5jsnunrghcenpmpczopm0mzpof.lambda-url.eu-west-3.on.aws/analyze';

function getCodeContent() {
  // Específico para GitHub, pero podemos expandirlo para otros sitios
  const codeElement = document.querySelector('.blob-code-inner');
  return codeElement ? codeElement.textContent : '';
}

async function analyzeCode(code) {
  console.log('Analyzing code...');
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
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'analyzeCode') {
    const code = getCodeContent();
    const analysis = await analyzeCode(code);
    sendResponse(analysis);
  }
  return true; // Indica que usaremos sendResponse asincrónicamente
});
