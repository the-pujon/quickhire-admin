"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { ThemeProvider } from "@/components/theme-provider";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </Provider>
  );
}
