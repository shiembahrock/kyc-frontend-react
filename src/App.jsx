import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { SessionExpiryProvider } from './context/SessionExpiryContext'
import { ModalProvider } from './context/ModalContext'
import Home from './pages/Home'
import CompleteOrder from './pages/CompleteOrder'
import PaymentSuccess from './pages/PaymentSuccess'
import SearchService from './pages/SearchService'
import Register from './pages/Register'
import RouteScrollToTop from './components/RouteScrollToTop'

function App() {
  return (
    <ToastProvider>
      <SessionExpiryProvider>
        <ModalProvider>
          <Router>
            <div className="App">
              <RouteScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/complete-order/:serviceId" element={<CompleteOrder />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/Search-Service" element={<SearchService />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </div>
          </Router>
        </ModalProvider>
      </SessionExpiryProvider>
    </ToastProvider>
  )
}

export default App
