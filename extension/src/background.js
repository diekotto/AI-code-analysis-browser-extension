// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {});
