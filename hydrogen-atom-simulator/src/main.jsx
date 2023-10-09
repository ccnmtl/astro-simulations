import React from 'react';
import { createRoot } from 'react-dom/client';
import HydrogenAtomSimulator from './HydrogenAtomSimulator.jsx';

const domContainer = document.querySelector('#sim-root');
const root = createRoot(domContainer);
root.render(<HydrogenAtomSimulator />);
