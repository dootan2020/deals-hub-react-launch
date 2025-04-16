
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Remove App.css import if not needed

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
