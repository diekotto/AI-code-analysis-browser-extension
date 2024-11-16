let sidePanelPort = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onConnect.addListener(async (port) => {
  console.log('Port connected:', port);
  if (port.name === 'sidepanel') {
    sidePanelPort = port;
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    sidePanelPort.postMessage({
      type: 'SIDEPANEL_CONNECTED',
      data: {
        tabId: tab.id,
        url: tab.url,
        title: tab.title,
      },
    });
    console.log('SidePanel connected');
    port.onDisconnect.addListener(() => {
      console.log('SidePanel disconnected');
      sidePanelPort = null;
    });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tabId, tab);

    if (sidePanelPort) {
      sidePanelPort.postMessage({
        type: 'TAB_UPDATED',
        data: {
          tabId,
          url: tab.url,
          title: tab.title,
        },
      });
    } else {
      console.error('[onUpdated] No sidepanel port found for tab:', tabId);
    }
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('Tab activated:', activeInfo);
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (sidePanelPort) {
    sidePanelPort.postMessage({
      type: 'TAB_CHANGED',
      data: {
        tabId: activeInfo.tabId,
        url: tab.url,
        title: tab.title,
      },
    });
  } else {
    console.error('[onActivated] No sidepanel port found for tab:', activeInfo.tabId);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let response = false;
  switch (request.action) {
    case 'GET_PAGE_INFO':
      pageInfoRequested(request, sender, sendResponse);
      response = true;
      break;
    case 'GET_PAGE_CODE':
      getPageCode(request, sender, sendResponse);
      response = true;
      break;
    default:
      response = false;
  }
  return response;
});

async function pageInfoRequested(request, sender, sendResponse) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    sendResponse({ success: false, error: 'No active tab found' });
    return;
  }
  console.log('Tab info:', tab);
  const url = tab.url;
  const title = tab.title;
  sendResponse({ url, title });
}

async function getPageCode(request, sender, sendResponse) {
  const codePlatform = request.codePlatform.toLowerCase();
  switch (codePlatform) {
    case 'github':
      const githubCode = await getGithubCode(request);
      sendResponse(githubCode);
      break;
    default:
      console.error('Unknown code platform:', request);
      break;
  }
}

async function getGithubCode() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // FIXME: The innerText is not returning the expected value
  const code = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      const codeBlock = document.getElementById('read-only-cursor-text-area').innerText;
      const fileName = document.getElementById('file-name-id-wide').innerText;
      return {
        lang: detectLanguageByExtension(fileName),
        code: codeBlock,
      };
    },
  });
  return { success: true, code };
}

function detectLanguageByExtension(fileName) {
  const ext = fileName.split('.').pop();
  switch (ext) {
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'sh':
      return 'shell';
    case 'py':
      return 'python';
    case 'cs':
    case 'csx':
    case 'csproj':
    case 'sln':
      return 'csharp';
    default:
      return '';
  }
}
