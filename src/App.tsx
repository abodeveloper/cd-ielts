import { Toaster } from "sonner";
import AppRouter from "./router/AppRouter";
import { useAutoLogout } from "./hooks/useAutoLogout";

function App() {
  // Logout when user completely leaves the website
  useAutoLogout({
    enabled: true,
    immediateOnExit: true, // Logout immediately when leaving website
    excludeTestPages: true, // Don't logout during test timeout, but logout on exit
  });

  return (
    <>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </>
  );
}

export default App;
