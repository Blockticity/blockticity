import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import COAViewer from './components/COAViewer'

function App() {
  return (
    <Router>
      <Routes>
        {/* Single route handles all cases with URL parameters for network selection */}
        {/* Examples:
            app.blockticity.ai                    → Mainnet (default)
            app.blockticity.ai/?network=testnet   → Testnet
            app.blockticity.ai/b0229206           → Mainnet COA
            app.blockticity.ai/b0229206?network=testnet → Testnet COA
            app.blockticity.ai/coa/mainnet-b0229206 → Mainnet COA (metadata URL format)
            app.blockticity.ai/coa/testnet-b0229206 → Testnet COA (metadata URL format)
        */}
        <Route path="/coa/:networkOrderId" element={<COAViewer />} />
        <Route path="/:orderId" element={<COAViewer />} />
        <Route path="/" element={<COAViewer />} />
      </Routes>
    </Router>
  )
}

export default App