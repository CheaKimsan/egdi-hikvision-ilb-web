import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import './index.css';
import './lib/assets/scss/app.scss';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient();
const appTheme = {
  ...webLightTheme,
  fontFamilyBase: '"Inter Variable", Inter, sans-serif',
};

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={appTheme}>
        <App />
      </FluentProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();
