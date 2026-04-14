import type { PropsWithChildren } from "react";
import { EditorStoreProvider } from "../../store";

export const AppProviders = ({ children }: PropsWithChildren) => (
  <EditorStoreProvider>{children}</EditorStoreProvider>
);
