import { TamaguiProvider } from "tamagui";
import { CONFIG } from "./config";
import { Router } from "./router";

function App() {
  return (
    <TamaguiProvider config={CONFIG.tamagui} defaultTheme="light">
      <Router />
    </TamaguiProvider>
  );
}

export default App;
