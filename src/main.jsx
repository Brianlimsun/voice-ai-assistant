import 'regenerator-runtime/runtime';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

console.log('Starting main.jsx execution');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.log('Creating root element');
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
}

try {
  console.log('Attempting to render app');
  const root = ReactDOM.createRoot(rootElement || document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
}