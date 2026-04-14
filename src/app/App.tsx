import { EditorShell } from "../features/editor";
import { AppHeader } from "../features/layout";
import { AppProviders } from "./providers/AppProviders";

export default function App() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-[#f3f5f8] text-slate-900">
        <AppHeader />
        <EditorShell />
      </div>
    </AppProviders>
  );
}
