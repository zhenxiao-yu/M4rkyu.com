import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AnimatedCursor from 'react-animated-cursor';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import Router from './Router';
import './theme/normalize.css';
import './theme/global.css';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

const AppRoot = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <React.StrictMode>
      <BrowserRouter>
        {!prefersReducedMotion && (
          <AnimatedCursor
            color={"75, 75, 75"}
            trailingSpeed={3}
            outerScale={5.5}
            innerScale={2}
            outerSize={8}
            innerSize={8}
            outerAlpha={0.4}
          />
        )}
        <Router />
        <Analytics mode="production" />
        <SpeedInsights />
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot />);
