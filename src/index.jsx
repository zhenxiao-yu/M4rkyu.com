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
        color={"96, 96, 96"}
        trailingSpeed={7}
        outerScale={3.5}
        innerScale={1.7}
        outerSize={15}
      />
      <Router />
    </BrowserRouter>
  </React.StrictMode>,
)