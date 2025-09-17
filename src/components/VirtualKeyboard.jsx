import React, { useState } from 'react'

const VirtualKeyboard = ({ value = '', onChange, onClose }) => {
  const [isShifted, setIsShifted] = useState(false)

  // Keyboard layout for Certificate IDs (alphanumeric only)
  const keyboardLayout = [
    // Numbers row
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    // First letter row  
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    // Second letter row
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    // Third letter row with special keys
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
  ]

  const handleKeyPress = (key) => {
    let newValue = value

    switch (key) {
      case 'backspace':
        newValue = value.slice(0, -1)
        break
      case 'shift':
        setIsShifted(!isShifted)
        return // Don't update value for shift
      case 'space':
        // Don't allow spaces in Certificate IDs
        return
      case 'clear':
        newValue = ''
        break
      default:
        // Add the character (uppercase if shifted)
        const char = isShifted ? key.toUpperCase() : key.toLowerCase()
        newValue = value + char
        
        // Auto-turn off shift after one character
        if (isShifted && key !== 'shift') {
          setIsShifted(false)
        }
        break
    }

    onChange({ target: { value: newValue } })
  }

  const renderKey = (key) => {
    let displayKey = key
    let className = 'virtual-key'
    let keyContent = key

    // Special key handling
    switch (key) {
      case 'shift':
        keyContent = isShifted ? '⬆️' : '⇧'
        className += isShifted ? ' virtual-key-active' : ' virtual-key-special'
        break
      case 'backspace':
        keyContent = '⌫'
        className += ' virtual-key-special'
        break
      case 'space':
        keyContent = 'space'
        className += ' virtual-key-space'
        break
      default:
        // Regular alphanumeric keys
        if (isShifted && /[a-z]/.test(key)) {
          keyContent = key.toUpperCase()
        }
        break
    }

    return (
      <button
        key={key}
        type="button"
        className={className}
        onClick={() => handleKeyPress(key)}
        onTouchStart={(e) => e.preventDefault()} // Prevent mobile touch issues
      >
        {keyContent}
      </button>
    )
  }

  return (
    <div className="virtual-keyboard-overlay">
      <div className="virtual-keyboard-container">
        {/* Header */}
        <div className="virtual-keyboard-header">
          <div className="virtual-keyboard-title">Certificate ID Keyboard</div>
          <button 
            type="button"
            className="virtual-keyboard-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Display */}
        <div className="virtual-keyboard-display">
          <div className="virtual-keyboard-input">
            {value || <span className="virtual-keyboard-placeholder">Enter Certificate ID...</span>}
            <span className="virtual-keyboard-cursor">|</span>
          </div>
        </div>

        {/* Keyboard */}
        <div className="virtual-keyboard">
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="virtual-keyboard-row">
              {row.map(renderKey)}
            </div>
          ))}
          
          {/* Bottom row with additional controls */}
          <div className="virtual-keyboard-row">
            <button
              type="button"
              className="virtual-key virtual-key-special"
              onClick={() => handleKeyPress('clear')}
            >
              Clear
            </button>
            <button
              type="button"
              className="virtual-key virtual-key-done"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="virtual-keyboard-help">
          Tap letters and numbers to build your Certificate ID (e.g., b0229206)
        </div>
      </div>
    </div>
  )
}

export default VirtualKeyboard