import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NetworkSelector = ({ currentNetwork }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNetworkSwitch = (newNetwork) => {
    // Determine the base path and preserve any token ID
    const pathParts = location.pathname.split('/')
    const hasTokenId = pathParts.length > 2 && pathParts[2] !== ''
    
    let newPath
    if (newNetwork === 'testnet') {
      newPath = hasTokenId ? `/test/${pathParts[2]}` : '/test'
    } else {
      newPath = hasTokenId ? `/main/${pathParts[2]}` : '/main'
    }
    
    // Preserve query parameters
    const queryString = location.search
    navigate(newPath + queryString)
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 1000,
      display: 'flex',
      gap: '8px'
    }}>
      <button
        onClick={() => handleNetworkSwitch('testnet')}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase',
          background: currentNetwork === 'testnet' ? '#f39c12' : 'rgba(255,255,255,0.2)',
          color: '#fff',
          transition: 'all 0.3s ease'
        }}
      >
        Testnet
      </button>
      <button
        onClick={() => handleNetworkSwitch('mainnet')}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase',
          background: currentNetwork === 'mainnet' ? '#27ae60' : 'rgba(255,255,255,0.2)',
          color: '#fff',
          transition: 'all 0.3s ease'
        }}
      >
        Mainnet
      </button>
    </div>
  )
}

export default NetworkSelector