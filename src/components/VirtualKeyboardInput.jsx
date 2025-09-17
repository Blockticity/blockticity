import React, { useState } from 'react'
import VirtualKeyboard from './VirtualKeyboard'

const VirtualKeyboardInput = ({ 
  value = '', 
  onChange, 
  placeholder = "e.g., b0229206",
  className = "input-field",
  required = false 
}) => {
  const [showKeyboard, setShowKeyboard] = useState(false)

  const handleInputClick = (e) => {
    e.preventDefault()
    e.target.blur() // Prevent mobile keyboard
    setShowKeyboard(true)
  }

  const handleKeyboardClose = () => {
    setShowKeyboard(false)
  }

  const handleKeyboardChange = (e) => {
    onChange(e)
  }

  return (
    <>
      {/* Display input (read-only, opens virtual keyboard) */}
      <div
        className={className}
        onClick={handleInputClick}
        style={{
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          minHeight: '50px',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '2px solid #2a2f3e',
          borderRadius: '8px',
          padding: '14px',
          color: value ? '#fff' : '#666',
          fontSize: '16px',
          userSelect: 'none'
        }}
        role="textbox"
        aria-label="Order ID - tap to open keyboard"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setShowKeyboard(true)
          }
        }}
      >
        {value || placeholder}
        
        {/* Virtual keyboard icon */}
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#5BD1D7',
          fontSize: '20px',
          pointerEvents: 'none'
        }}>
          ⌨️
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        value={value}
        required={required}
      />

      {/* Virtual keyboard overlay */}
      {showKeyboard && (
        <VirtualKeyboard
          value={value}
          onChange={handleKeyboardChange}
          onClose={handleKeyboardClose}
        />
      )}
    </>
  )
}

export default VirtualKeyboardInput