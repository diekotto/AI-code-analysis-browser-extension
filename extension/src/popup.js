document.addEventListener('DOMContentLoaded', async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeCode' }, (response) => {
    const recommendationsDiv = document.getElementById('recommendations');
    
    if (response.error) {
      recommendationsDiv.innerHTML = `<div class="error">${response.error}</div>`;
      return;
    }
    
    // Mostrar recomendaciones
    recommendationsDiv.innerHTML = response.recommendations
      .map(rec => `
        <div class="recommendation">
          <h3>${rec.title}</h3>
          <p>${rec.description}</p>
        </div>
      `)
      .join('');
  });
});
