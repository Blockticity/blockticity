import React, { useState, useRef, useEffect } from 'react'
import VirtualKeyboard from './VirtualKeyboard'

const NativeFirstInput = ({ 
  value = '', 
  onChange, 
  placeholder = "e.g., b0229206",
  className = "input-field",
  required = false 
}) => {
  const [showVirtualKeyboardOption, setShowVirtualKeyboardOption] = useState(false)
  const [useVirtualKeyboard, setUseVirtualKeyboard] = useState(false)
  const [inputType, setInputType] = useState('text')
  const [focusCount, setFocusCount] = useState(0)
  const inputRef = useRef(null)

  // Try different input types if user is struggling
  const inputTypeProgression = ['text', 'search', 'url', 'email']

  useEffect(() => {
    // Show virtual keyboard option after multiple focus attempts
    if (focusCount >= 2 && !value) {
      setShowVirtualKeyboardOption(true)
    }
  }, [focusCount, value])

  const handleFocus = () => {
    setFocusCount(prev => prev + 1)
    
    // Try next input type if struggling (and value is empty)
    if (focusCount > 0 && !value && focusCount < inputTypeProgression.length) {
      const nextType = inputTypeProgression[focusCount]
      console.log(`📱 Trying input type: ${nextType}`)
      setInputType(nextType)
    }
  }

  const handleToggleVirtualKeyboard = () => {
    setUseVirtualKeyboard(!useVirtualKeyboard)
    if (!useVirtualKeyboard && inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleVirtualKeyboardChange = (e) => {
    onChange(e)
  }

  const handleNativeInputChange = (e) => {
    onChange(e)
    // Hide virtual keyboard option if user successfully types
    if (e.target.value && showVirtualKeyboardOption) {
      setShowVirtualKeyboardOption(false)
    }
  }

  // If using virtual keyboard, show the virtual keyboard UI
  if (useVirtualKeyboard) {
    return (
      <>
        {/* Display value with virtual keyboard active */}
        <div style={{ position: 'relative' }}>
          <div
            className={className}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '50px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '2px solid #5BD1D7',
              borderRadius: '8px',
              padding: '14px',
              color: value ? '#fff' : '#666',
              fontSize: '16px',
              userSelect: 'none'
            }}
          >
            <span>{value || placeholder}</span>
            <button
              onClick={handleToggleVirtualKeyboard}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#5BD1D7',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px'
              }}
            >
              Use native
            </button>
          </div>
        </div>

        {/* Virtual keyboard */}
        <VirtualKeyboard
          value={value}
          onChange={handleVirtualKeyboardChange}
          onClose={() => setUseVirtualKeyboard(false)}
        />
      </>
    )
  }

  // Default: Native input with optional virtual keyboard toggle
  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type={inputType}
        inputMode="text"
        pattern="[a-zA-Z0-9]*"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        enterKeyHint="search"
        value={value}
        onChange={handleNativeInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        required={required}
        style={{
          width: '100%',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
      />

      {/* Show virtual keyboard option if user might be struggling */}
      {showVirtualKeyboardOption && !value && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            padding: '8px',
            background: 'rgba(91, 209, 215, 0.1)',
            border: '1px solid rgba(91, 209, 215, 0.3)',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#5BD1D7',
            textAlign: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
          onClick={handleToggleVirtualKeyboard}
        >
          <span style={{ marginRight: '8px' }}>⌨️</span>
          Having trouble typing? Try our virtual keyboard
        </div>
      )}

      {/* Small toggle in corner for users who know they need it */}
      <button
        onClick={handleToggleVirtualKeyboard}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          color: '#5BD1D7',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '4px',
          opacity: 0.6,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.6'}
        title="Use virtual keyboard"
        aria-label="Toggle virtual keyboard"
      >
        ⌨️
      </button>
    </div>
  )
}

export default NativeFirstInput