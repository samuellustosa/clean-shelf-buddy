import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registado com sucesso:', registration);
      })
      .catch(error => {
        console.error('Falha no registo do Service Worker:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);