import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './Router'
import AnimatedCursor from "react-animated-cursor"
import './theme/normalize.css'
import './theme/global.css'
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
      <AnimatedCursor
        color={"75, 75, 75"}
        trailingSpeed={9}
        outerScale={5.5}
        innerScale={2}
        outerSize={10}
        innerSize={8}
        outerAlpha={0.4}
      />
      <Router />
    </BrowserRouter>
  // </React.StrictMode>,
)