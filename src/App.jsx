import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CompleteOrder from './pages/CompleteOrder'
import PaymentSuccess from './pages/PaymentSuccess'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complete-order/:serviceId" element={<CompleteOrder />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
