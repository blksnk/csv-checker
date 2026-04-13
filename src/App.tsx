import { TamaguiProvider } from "tamagui";
import { CONFIG } from "./config";
import { Router } from "./router";

/**
 * Root app: Tamagui provider and client router.
 *
 * @return {JSX.Element} Application tree
 */
function App() {
  return (
    <TamaguiProvider config={CONFIG.tamagui} defaultTheme="light">
      <Router />
    </TamaguiProvider>
  );
}

export default App;
