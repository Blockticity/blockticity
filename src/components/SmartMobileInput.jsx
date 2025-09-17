import React, { useState, useRef, useEffect } from 'react'
import VirtualKeyboard from './VirtualKeyboard'

const SmartMobileInput = ({ 
  value = '', 
  onChange, 
  placeholder = "e.g., b0229206",
  className = "input-field",
  required = false 
}) => {
  const [useVirtualKeyboard, setUseVirtualKeyboard] = useState(false)
  const [inputMethod, setInputMethod] = useState('native') // 'native', 'contenteditable', 'virtual'
  const [localValue, setLocalValue] = useState(value)
  const contentEditableRef = useRef(null)
  const nativeInputRef = useRef(null)

  // Detect mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Update parent component
  const handleValueChange = (newValue) => {
    setLocalValue(newValue)
    onChange({ target: { value: newValue } })
  }

  // ContentEditable handlers
  const handleContentEditableInput = (e) => {
    const text = e.currentTarget.textContent || ''
    handleValueChange(text)
  }

  const handleContentEditableKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  // Method switching
  const switchToContentEditable = () => {
    setInputMethod('contenteditable')
    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.focus()
      }
    }, 100)
  }

  const switchToVirtualKeyboard = () => {
    setInputMethod('virtual')
    setUseVirtualKeyboard(true)
  }

  const switchToNative = () => {
    setInputMethod('native')
    setUseVirtualKeyboard(false)
  }

  // Render virtual keyboard method
  if (inputMethod === 'virtual') {
    return (
      <>
        <div style={{ position: 'relative' }}>
          <div
            className={className}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '50px',
              border: '2px solid #5BD1D7',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '14px',
              color: localValue ? '#fff' : '#666',
              fontSize: '16px'
            }}
          >
            <span>{localValue || placeholder}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={switchToNative}
                style={{
                  background: 'rgba(91, 209, 215, 0.2)',
                  border: '1px solid #5BD1D7',
                  color: '#5BD1D7',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Native
              </button>
              <button
                onClick={switchToContentEditable}
                style={{
                  background: 'rgba(91, 209, 215, 0.2)',
                  border: '1px solid #5BD1D7',
                  color: '#5BD1D7',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Text Box
              </button>
            </div>
          </div>
        </div>
        <VirtualKeyboard
          value={localValue}
          onChange={(e) => handleValueChange(e.target.value)}
          onClose={() => setUseVirtualKeyboard(false)}
        />
      </>
    )
  }

  // Render ContentEditable method
  if (inputMethod === 'contenteditable') {
    return (
      <div style={{ position: 'relative' }}>
        <div
          ref={contentEditableRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentEditableInput}
          onKeyDown={handleContentEditableKeyDown}
          className={className}
          style={{
            minHeight: '50px',
            padding: '14px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '2px solid #2a2f3e',
            borderRadius: '8px',
            color: localValue ? '#fff' : '#666',
            fontSize: '16px',
            outline: 'none',
            cursor: 'text',
            WebkitUserSelect: 'text',
            userSelect: 'text',
            wordBreak: 'break-word'
          }}
          data-placeholder={placeholder}
          role="textbox"
          aria-label="Order ID"
        >
          {localValue}
        </div>

        {/* Method switcher for ContentEditable */}
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            display: 'flex',
            gap: '8px',
            fontSize: '12px'
          }}
        >
          <button
            onClick={switchToNative}
            style={{
              flex: 1,
              padding: '4px',
              background: 'rgba(91, 209, 215, 0.1)',
              border: '1px solid rgba(91, 209, 215, 0.3)',
              borderRadius: '4px',
              color: '#5BD1D7',
              cursor: 'pointer'
            }}
          >
            Try Native Input
          </button>
          <button
            onClick={switchToVirtualKeyboard}
            style={{
              flex: 1,
              padding: '4px',
              background: 'rgba(91, 209, 215, 0.1)',
              border: '1px solid rgba(91, 209, 215, 0.3)',
              borderRadius: '4px',
              color: '#5BD1D7',
              cursor: 'pointer'
            }}
          >
            ⌨️ Virtual Keyboard
          </button>
        </div>
      </div>
    )
  }

  // Default: Native input with comprehensive attributes
  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={nativeInputRef}
        type="text"
        inputMode="text"
        pattern="[a-zA-Z0-9]*"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        enterKeyHint="search"
        value={localValue}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        required={required}
        style={{
          width: '100%',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          fontSize: '16px', // Prevents zoom on iOS
          // Force text input appearance
          WebkitTextSecurity: 'none',
          textSecurity: 'none'
        }}
        // Additional mobile-specific attributes
        data-form-type="other"
        data-lpignore="true"
        x-autocompletetype="off"
      />

      {/* Input method options (only show on mobile) */}
      {isMobile && (
        <div 
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '4px'
          }}
        >
          <button
            onClick={switchToContentEditable}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#5BD1D7',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              opacity: 0.6
            }}
            title="Try text box input"
            aria-label="Switch to text box"
          >
            📝
          </button>
          <button
            onClick={switchToVirtualKeyboard}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#5BD1D7',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              opacity: 0.6
            }}
            title="Use virtual keyboard"
            aria-label="Switch to virtual keyboard"
          >
            ⌨️
          </button>
        </div>
      )}

      {/* Help text for mobile users */}
      {isMobile && !localValue && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            fontSize: '11px',
            color: 'rgba(91, 209, 215, 0.7)',
            textAlign: 'center'
          }}
        >
          Tap 📝 for text box or ⌨️ for virtual keyboard if needed
        </div>
      )}
    </div>
  )
}

export default SmartMobileInput