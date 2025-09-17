import React, { useState, useEffect, useRef } from 'react'

const MobileOrderInput = ({ 
  value, 
  onChange, 
  placeholder = "e.g., b0229206",
  className = "input-field",
  required = false 
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const [useTextarea, setUseTextarea] = useState(false)
  const divRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword))
      const isTouchDevice = 'ontouchstart' in window
      const isSmallScreen = window.innerWidth < 768
      
      return isMobileDevice || (isTouchDevice && isSmallScreen)
    }
    
    setIsMobile(checkMobile())
  }, [])

  // Handle contenteditable div changes
  const handleDivInput = (e) => {
    const text = e.target.textContent || ''
    // Only allow alphanumeric characters
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '')
    
    if (cleaned !== text) {
      // Update the div content if we cleaned anything
      e.target.textContent = cleaned
      // Move cursor to end
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(e.target)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    
    onChange({ target: { value: cleaned } })
  }

  // Handle regular input changes
  const handleInputChange = (e) => {
    const text = e.target.value
    // Only allow alphanumeric characters
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '')
    
    if (cleaned !== text) {
      e.target.value = cleaned
    }
    
    onChange({ target: { value: cleaned } })
  }

  // Handle textarea changes
  const handleTextareaChange = (e) => {
    const text = e.target.value.replace(/[\n\r]/g, '') // Remove line breaks
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '')
    
    if (cleaned !== text) {
      e.target.value = cleaned
    }
    
    onChange({ target: { value: cleaned } })
  }

  // Switch to textarea fallback
  const switchToTextarea = () => {
    setUseTextarea(true)
  }

  // Set focus to contenteditable div
  const focusDiv = () => {
    if (divRef.current) {
      divRef.current.focus()
    }
  }

  // Handle keydown events
  const handleKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return
    }
    
    // Ensure it's alphanumeric
    if (!/[a-zA-Z0-9]/.test(e.key)) {
      e.preventDefault()
    }
  }

  // Mobile version with textarea fallback option
  if (isMobile && useTextarea) {
    return (
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          className={className}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          style={{
            resize: 'none',
            overflow: 'hidden',
            fontSize: '16px !important',
            fontFamily: 'inherit',
            lineHeight: '1.5'
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          required={required}
        />
      </div>
    )
  }

  // Mobile version with contenteditable div
  if (isMobile) {
    return (
      <div style={{ position: 'relative' }}>
        <div
          ref={divRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          className={className}
          style={{
            minHeight: '50px',
            padding: '14px',
            border: '2px solid #2a2f3e',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.3)',
            color: '#fff',
            fontSize: '16px',
            outline: 'none',
            cursor: 'text',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
          onInput={handleDivInput}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            e.target.style.borderColor = '#5BD1D7'
            e.target.style.background = 'rgba(91, 209, 215, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#2a2f3e'
            e.target.style.background = 'rgba(0, 0, 0, 0.3)'
          }}
          role="textbox"
          aria-label="Order ID"
        >
          {value || ''}
        </div>
        
        {/* Placeholder overlay */}
        {!value && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              color: '#666',
              pointerEvents: 'none',
              fontSize: '16px'
            }}
            onClick={focusDiv}
          >
            {placeholder}
          </div>
        )}
        
        {/* Fallback button */}
        <button
          type="button"
          onClick={switchToTextarea}
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: 'rgba(91, 209, 215, 0.8)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Try Textarea
        </button>
        
        {/* Hidden input for form submission */}
        <input
          ref={inputRef}
          type="hidden"
          value={value}
          required={required}
        />
      </div>
    )
  }

  // Desktop version with regular input
  return (
    <input
      ref={inputRef}
      type="text"
      className={className}
      value={value}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      required={required}
    />
  )
}

export default MobileOrderInput