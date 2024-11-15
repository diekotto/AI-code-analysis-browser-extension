declare namespace Chrome {
  export interface Runtime {
    sendMessage<T = any, R = any>(
      message: T,
      callback?: (response: R) => void
    ): void;
    lastError?: {
      message: string;
    };
  }
}

declare var chrome: {
  runtime: Chrome.Runtime;
  // Añade aquí más APIs de Chrome que necesites
};
