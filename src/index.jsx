import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './Router'
import AnimatedCursor from "react-animated-cursor"
import './theme/normalize.css'
import './theme/global.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AnimatedCursor
        color={"75, 75, 75"}
        trailingSpeed={7}
        outerScale={3.5}
        innerScale={2.7}
        outerSize={10}
      />
      <Router />
    </BrowserRouter>
  </React.StrictMode>,
)