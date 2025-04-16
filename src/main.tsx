
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Đảm bảo DOM đã sẵn sàng trước khi render
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
  }
});
