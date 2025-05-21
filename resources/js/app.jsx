import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import ChatbotIcon from './Components/ChatbotIcon';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx'),
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);

    // Get the user from Inertia props
    const user = props.initialPage.props?.auth?.user;
    root.render(
      <>
        <App {...props} />
        <ChatbotIcon user={user} /> 
      </>
    );
  },
  progress: {
    color: '#4B5563',
  },
});
