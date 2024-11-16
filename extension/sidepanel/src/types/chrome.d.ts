declare namespace Chrome {
  export interface Runtime {
    sendMessage<T = any, R = any>(message: T, callback?: (response: R) => void): void;
    lastError?: {
      message: string;
    };
    connect: (options: { name: string }) => chrome.runtime.Port;
  }
}

declare var chrome: {
  runtime: Chrome.Runtime;
  tabs: {
    query: (
      queryInfo: { active: boolean; lastFocusedWindow: boolean },
      callback: (tabs: chrome.tabs.Tab[]) => void
    ) => void;
  };
  sidePanel: {
    open: (options: { tabId?: number; windowId?: number }) => Promise<void>;
  };
  windows: {
    getAll: (options: { windowTypes: string[]; populate: boolean }) => Promise<chrome.windows.Window[]>;
  };
};
