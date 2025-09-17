import React, { useState, useRef, useEffect } from 'react'
import VirtualKeyboard from './VirtualKeyboard'

const EnhancedMobileInput = ({ 
  value = '', 
  onChange, 
  placeholder = "Enter Certificate ID (e.g., b0229206)",
  className = "input-field",
  required = false 
}) => {
  const [useVirtualKeyboard, setUseVirtualKeyboard] = useState(false)
  const [inputMethod, setInputMethod] = useState('native')
  const [localValue, setLocalValue] = useState(value)
  const [showFallbackOptions, setShowFallbackOptions] = useState(false)
  const nativeInputRef = useRef(null)
  const contentEditableRef = useRef(null)
  const focusTimeoutRef = useRef(null)

  // Enhanced mobile detection
  const isMobile = () => {
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (typeof window.orientation !== 'undefined') ||
           (navigator.maxTouchPoints > 2)
  }

  // Detect iOS specifically for iOS-specific optimizations
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  }

  // Detect Android specifically
  const isAndroid = () => {
    return /Android/.test(navigator.userAgent)
  }

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleValueChange = (newValue) => {
    setLocalValue(newValue)
    onChange({ target: { value: newValue } })
  }

  // Enhanced focus handling with fallback detection
  const handleNativeFocus = () => {
    // Show fallback options after some delay to help users
    if (!localValue) {
      clearTimeout(focusTimeoutRef.current)
      focusTimeoutRef.current = setTimeout(() => {
        setShowFallbackOptions(true)
      }, 5000) // Show after 5 seconds if still empty
    }
  }

  const handleNativeInput = (e) => {
    handleValueChange(e.target.value)
    // Hide fallback options if user successfully types
    if (e.target.value && showFallbackOptions) {
      setShowFallbackOptions(false)
    }
    clearTimeout(focusTimeoutRef.current)
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
    // Prevent line breaks
    if (e.key === 'Enter' || e.key === 'Return') {
      e.preventDefault()
    }
  }

  const handleContentEditablePaste = (e) => {
    e.preventDefault()
    const text = (e.clipboardData || window.clipboardData).getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  // Method switching functions
  const switchToContentEditable = () => {
    setInputMethod('contenteditable')
    setShowFallbackOptions(false)
    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.focus()
        // Place cursor at end
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(contentEditableRef.current)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }, 100)
  }

  const switchToVirtualKeyboard = () => {
    setInputMethod('virtual')
    setUseVirtualKeyboard(true)
    setShowFallbackOptions(false)
  }

  const switchToNative = () => {
    setInputMethod('native')
    setUseVirtualKeyboard(false)
    setShowFallbackOptions(false)
    setTimeout(() => {
      if (nativeInputRef.current) {
        nativeInputRef.current.focus()
      }
    }, 100)
  }

  // Virtual keyboard method
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
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={switchToNative}
                style={{
                  background: 'rgba(91, 209, 215, 0.2)',
                  border: '1px solid #5BD1D7',
                  color: '#5BD1D7',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '11px',
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
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Text
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

  // ContentEditable method with enhanced styling
  if (inputMethod === 'contenteditable') {
    return (
      <div style={{ position: 'relative' }}>
        <div
          ref={contentEditableRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentEditableInput}
          onKeyDown={handleContentEditableKeyDown}
          onPaste={handleContentEditablePaste}
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
            wordBreak: 'break-word',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            // Prevent line breaks
            lineHeight: '1.2',
            maxHeight: '50px'
          }}
          data-placeholder={!localValue ? placeholder : ''}
          role="textbox"
          aria-label="Certificate ID"
        >
          {localValue}
        </div>

        {/* Method switcher for ContentEditable */}
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            display: 'flex',
            gap: '4px',
            fontSize: '11px'
          }}
        >
          <button
            onClick={switchToNative}
            style={{
              padding: '2px 6px',
              background: 'rgba(91, 209, 215, 0.1)',
              border: '1px solid rgba(91, 209, 215, 0.3)',
              borderRadius: '3px',
              color: '#5BD1D7',
              cursor: 'pointer'
            }}
          >
            Native
          </button>
          <button
            onClick={switchToVirtualKeyboard}
            style={{
              padding: '2px 6px',
              background: 'rgba(91, 209, 215, 0.1)',
              border: '1px solid rgba(91, 209, 215, 0.3)',
              borderRadius: '3px',
              color: '#5BD1D7',
              cursor: 'pointer'
            }}
          >
            ⌨️
          </button>
        </div>
      </div>
    )
  }

  // Enhanced native input with device-specific optimizations
  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={nativeInputRef}
        // Enhanced input attributes for better mobile keyboard support
        type="text"
        inputMode="text"                    // Primary: Force text keyboard
        pattern="[a-zA-Z0-9]*"             // Allow alphanumeric
        autoComplete="off"                 // Disable autocomplete
        autoCorrect="off"                  // Disable autocorrect
        autoCapitalize="none"              // Disable auto-capitalize
        spellCheck="false"                 // Disable spellcheck
        enterKeyHint="search"              // Show search button on mobile
        value={localValue}
        onChange={handleNativeInput}
        onFocus={handleNativeFocus}
        placeholder={placeholder}
        className={className}
        required={required}
        style={{
          width: '100%',
          // Remove browser styling
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          // iOS-specific optimizations
          fontSize: isIOS() ? '16px' : '14px', // 16px prevents iOS zoom
          // Android-specific optimizations
          WebkitTextSizeAdjust: isAndroid() ? '100%' : 'none',
          // General mobile optimizations
          WebkitTapHighlightColor: 'transparent',
          WebkitUserSelect: 'text',
          userSelect: 'text',
          // Force text input type behavior
          WebkitTextSecurity: 'none',
          textSecurity: 'none',
          // Prevent unexpected behaviors
          textTransform: 'none',
          letterSpacing: 'normal',
          wordSpacing: 'normal'
        }}
        // Additional attributes for various browsers/devices
        data-form-type="other"           // Hint for password managers
        data-lpignore="true"             // LastPass ignore
        x-autocompletetype="off"         // Legacy autocomplete
        autoFocus={false}                // Prevent auto-focus issues
        // HTML5 input enhancements
        list=""                          // Disable datalist
        role="textbox"                   // Accessibility
        aria-label="Certificate ID Input"     // Screen readers
        // Mobile-specific form attributes
        formNoValidate={true}            // Disable HTML5 validation popup on mobile
      />

      {/* Smart fallback options - only show on mobile when needed */}
      {isMobile() && (
        <>
          {/* Quick access buttons (always visible but subtle) */}
          <div 
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              gap: '4px',
              opacity: 0.5
            }}
          >
            <button
              onClick={switchToContentEditable}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#5BD1D7',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px',
                lineHeight: 1
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
                fontSize: '14px',
                padding: '2px',
                lineHeight: 1
              }}
              title="Use virtual keyboard"
              aria-label="Switch to virtual keyboard"
            >
              ⌨️
            </button>
          </div>

          {/* Fallback suggestion (appears after struggling) */}
          {showFallbackOptions && !localValue && (
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
                fontSize: '12px',
                color: '#5BD1D7',
                textAlign: 'center',
                zIndex: 10,
                animation: 'fadeIn 0.3s ease-in'
              }}
            >
              Having trouble? Try 📝 text box or ⌨️ virtual keyboard
              <button
                onClick={() => setShowFallbackOptions(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#5BD1D7',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EnhancedMobileInput