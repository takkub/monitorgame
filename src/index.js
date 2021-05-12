import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import 'antd/dist/antd.css';
const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
ReactDOM.render(<AppWithRouter />, document.getElementById('root'))
