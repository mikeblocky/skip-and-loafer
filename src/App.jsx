import AppChrome from './features/app/AppChrome';
import { useAppController } from './features/app/hooks/useAppController';

function App() {
  const app = useAppController();
  return <AppChrome app={app} />;
}

export default App;
