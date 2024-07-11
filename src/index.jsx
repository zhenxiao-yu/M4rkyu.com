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
        color={"8, 9, 10"}
        trailingSpeed={7}
        outerScale={5.5}
        innerScale={3.7}
        outerSize={10}
      />
      <Router />
    </BrowserRouter>
  </React.StrictMode>,
)