import React, { useState, useEffect, useRef } from 'react'

const MobileKeyboardTroubleshooter = ({ 
  value, 
  onChange, 
  placeholder = "e.g., b0229206",
  className = "input-field",
  required = false 
}) => {
  const [method, setMethod] = useState('auto')
  const [debugInfo, setDebugInfo] = useState({})
  const [logs, setLogs] = useState([])
  
  const inputRef = useRef(null)
  const textareaRef = useRef(null)
  const divRef = useRef(null)

  // Add log
  const addLog = (message) => {
    console.log('🔍 MobileKeyboard:', message)
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Detect device and capabilities
  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      touchSupport: 'ontouchstart' in window,
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      hasVirtualKeyboard: 'virtualKeyboard' in navigator,
      devicePixelRatio: window.devicePixelRatio,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      isMobile: /Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent),
      browser: (() => {
        if (/Chrome/.test(navigator.userAgent)) return 'Chrome'
        if (/Safari/.test(navigator.userAgent)) return 'Safari'  
        if (/Firefox/.test(navigator.userAgent)) return 'Firefox'
        return 'Unknown'
      })()
    }
    
    setDebugInfo(info)
    addLog(`Device detected: ${info.browser} on ${info.isIOS ? 'iOS' : info.isAndroid ? 'Android' : 'Desktop'}`)
    
    // Auto-select method based on device
    if (info.isMobile) {
      if (info.isIOS) {
        setMethod('textarea') // iOS is very stubborn
        addLog('Auto-selected textarea for iOS')
      } else if (info.isAndroid) {
        setMethod('contenteditable') // Android might work with contenteditable
        addLog('Auto-selected contenteditable for Android')
      }
    } else {
      setMethod('input')
      addLog('Auto-selected input for desktop')
    }
  }, [])

  // Handle value changes
  const handleChange = (newValue) => {
    // Clean to alphanumeric only
    const cleaned = newValue.replace(/[^a-zA-Z0-9]/g, '')
    if (cleaned !== newValue) {
      addLog(`Cleaned input: "${newValue}" → "${cleaned}"`)
    }
    onChange({ target: { value: cleaned } })
  }

  // Input handlers for each method
  const handleInputChange = (e) => handleChange(e.target.value)
  const handleTextareaChange = (e) => handleChange(e.target.value.replace(/[\n\r]/g, ''))
  const handleDivInput = (e) => handleChange(e.target.textContent || '')

  // Focus handlers with logging
  const handleFocus = (methodName) => {
    addLog(`${methodName} focused - checking keyboard`)
    setTimeout(() => {
      // Try to detect if virtual keyboard appeared
      const heightDiff = window.screen.height - window.innerHeight
      addLog(`Height difference: ${heightDiff}px (keyboard likely ${heightDiff > 200 ? 'visible' : 'not visible'})`)
    }, 300)
  }

  // Force different input methods
  const forceMethod = (newMethod) => {
    setMethod(newMethod)
    addLog(`Manually switched to: ${newMethod}`)
  }

  // Render different input methods
  const renderInput = () => {
    const commonProps = {
      value: method === 'contenteditable' ? undefined : value,
      onChange: method === 'input' ? handleInputChange :
               method === 'textarea' ? handleTextareaChange : undefined,
      onInput: method === 'contenteditable' ? handleDivInput : undefined,
      className,
      placeholder,
      required,
      onFocus: () => handleFocus(method),
      style: {
        fontSize: '16px !important', // Prevent iOS zoom
        minHeight: '50px',
        padding: '14px',
        border: '2px solid #2a2f3e',
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.3)',
        color: '#fff',
        width: '100%',
        boxSizing: 'border-box'
      }
    }

    switch (method) {
      case 'input-text':
        return (
          <input
            ref={inputRef}
            type="text"
            {...commonProps}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
          />
        )

      case 'input-search':
        return (
          <input
            ref={inputRef}
            type="search"
            {...commonProps}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
          />
        )

      case 'input-url':
        return (
          <input
            ref={inputRef}
            type="url"
            {...commonProps}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
          />
        )

      case 'input-email':
        return (
          <input
            ref={inputRef}
            type="email"
            {...commonProps}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        )

      case 'textarea':
        return (
          <textarea
            ref={textareaRef}
            {...commonProps}
            rows={1}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            style={{
              ...commonProps.style,
              resize: 'none',
              overflow: 'hidden',
              fontFamily: 'inherit'
            }}
          />
        )

      case 'contenteditable':
        return (
          <div
            ref={divRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            {...commonProps}
            style={{
              ...commonProps.style,
              outline: 'none',
              cursor: 'text',
              minHeight: '50px'
            }}
            onFocus={() => handleFocus('contenteditable')}
            role="textbox"
            aria-label="Order ID"
          >
            {value || ''}
          </div>
        )

      case 'input':
      default:
        return (
          <input
            ref={inputRef}
            type="text"
            {...commonProps}
          />
        )
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Method Selector */}
      <div style={{ 
        marginBottom: '10px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '5px',
        fontSize: '12px'
      }}>
        <span style={{ color: '#5BD1D7', fontWeight: 'bold' }}>Try Method:</span>
        {[
          { key: 'input-text', label: 'Text' },
          { key: 'input-search', label: 'Search' },
          { key: 'input-url', label: 'URL' },
          { key: 'input-email', label: 'Email' },
          { key: 'textarea', label: 'Textarea' },
          { key: 'contenteditable', label: 'Div' }
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => forceMethod(key)}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              border: 'none',
              borderRadius: '4px',
              background: method === key ? '#5BD1D7' : 'rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* The actual input */}
      {renderInput()}

      {/* Placeholder for contenteditable */}
      {method === 'contenteditable' && !value && (
        <div
          style={{
            position: 'absolute',
            top: '46px',
            left: '16px',
            color: '#666',
            pointerEvents: 'none',
            fontSize: '16px'
          }}
        >
          {placeholder}
        </div>
      )}

      {/* Debug info */}
      <div style={{
        marginTop: '10px',
        padding: '10px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#a8b2c7'
      }}>
        <div><strong>Current:</strong> {method}</div>
        <div><strong>Device:</strong> {debugInfo.browser} on {debugInfo.isIOS ? 'iOS' : debugInfo.isAndroid ? 'Android' : 'Desktop'}</div>
        <div><strong>Screen:</strong> {debugInfo.screenSize} | <strong>Viewport:</strong> {debugInfo.viewportSize}</div>
        <div><strong>Value:</strong> "{value}" ({value?.length || 0} chars)</div>
        
        <div style={{ marginTop: '8px' }}>
          <strong>Recent logs:</strong>
          {logs.map((log, i) => (
            <div key={i} style={{ fontSize: '10px', color: '#5BD1D7' }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MobileKeyboardTroubleshooter