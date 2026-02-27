import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { SessionExpiryProvider } from './context/SessionExpiryContext'
import Home from './pages/Home'
import CompleteOrder from './pages/CompleteOrder'
import PaymentSuccess from './pages/PaymentSuccess'
import SearchService from './pages/SearchService'

function App() {
  return (
    <ToastProvider>
      <SessionExpiryProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/complete-order/:serviceId" element={<CompleteOrder />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/Search-Service" element={<SearchService />} />
            </Routes>
          </div>
        </Router>
      </SessionExpiryProvider>
    </ToastProvider>
  )
}

export default App
