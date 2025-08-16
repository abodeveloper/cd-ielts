import { Toaster } from "sonner";
import AppRouter from "./router/AppRouter";

function App() {


  return (
    <>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </>
  );
}

export default App;
