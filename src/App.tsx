import React from 'react';
import { createRoot } from 'react-dom/client';

import Root from './root';

// local development
const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<Root />);
