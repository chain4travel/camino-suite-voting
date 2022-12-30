import React from 'react';
import { createRoot } from 'react-dom/client';

import Root from './root';
import './locales/i18n';

// local development
const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<Root />);
