import { useEffect, useRef, useState } from 'react'
import './App.css'
import ModelLoader from './components/ModelLoder'

function App() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState('')
  // 'user' = front camera, 'environment' = back camera.
  const [facingMode, setFacingMode] = useState('user')

  // Stop any tracks currently held so the device can be reused.
  const stopTracks = () => {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Open the camera for a given facing mode and attach it to the video.
  const openStream = async (mode) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode },
      audio: false,
    })
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
    return stream
  }

  const describeError = (err) => {
    if (err?.name === 'NotAllowedError') {
      return 'Camera permission was denied. Please allow access and try again.'
    }
    if (err?.name === 'NotFoundError') {
      return 'No camera was found on this device.'
    }
    return 'Could not start the camera. Please try again.'
  }

  const startCamera = async () => {
    setError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      // getUserMedia is only available in a secure context (HTTPS or
      // localhost). Over a plain http:// LAN address it is undefined.
      if (!window.isSecureContext) {
        setError(
          'Camera needs a secure connection. Open this page over HTTPS or on localhost.',
        )
      } else {
        setError('Camera access is not supported in this browser.')
      }
      return
    }

    setIsLoading(true)
    try {
      await openStream(facingMode)
      setIsActive(true)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const switchCamera = async () => {
    if (!isActive || isSwitching) return

    const nextMode = facingMode === 'user' ? 'environment' : 'user'
    setError('')
    setIsSwitching(true)

    // Release the current camera before requesting the other one; many
    // mobile devices won't open the second camera while the first is held.
    stopTracks()

    try {
      await openStream(nextMode)
      setFacingMode(nextMode)
    } catch {
      // Switching failed (e.g. device has only one camera). Fall back to
      // the original camera so the preview keeps working.
      try {
        await openStream(facingMode)
      } catch {
        setIsActive(false)
      }
      setError('Could not switch camera. This device may have only one camera.')
    } finally {
      setIsSwitching(false)
    }
  }

  const stopCamera = () => {
    stopTracks()
    setIsActive(false)
  }

  // Clean up the camera stream when the component unmounts.
  useEffect(() => {
    return () => {
      const stream = streamRef.current
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const isFront = facingMode === 'user'

  return (
    <div className="app">
      <header className="app-bar">
        <h1 className="app-name">VEYRA</h1>
      </header>

      <main
        className={`camera-view ${isActive ? 'is-active' : ''} ${
          isFront ? 'is-front' : ''
        }`}
      >
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />

        {!isActive && (
          <div className="camera-placeholder">
            <svg className="camera-glyph" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2.5l4 2.5V6l-4 2.5V8a2 2 0 0 0-2-2H4Z"
              />
            </svg>
            <p>Camera is off</p>
          </div>
        )}

        {error && (
          <p className="camera-error" role="alert">
            {error}
          </p>
        )}
      </main>

      <footer className="camera-controls">
        {!isActive ? (
          <button
            type="button"
            className="btn btn-start"
            onClick={startCamera}
            disabled={isLoading}
          >
            {isLoading ? 'Starting…' : 'Start Camera'}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-icon"
              onClick={switchCamera}
              disabled={isSwitching}
              aria-label={isFront ? 'Switch to back camera' : 'Switch to front camera'}
              title={isFront ? 'Switch to back camera' : 'Switch to front camera'}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {/* rotation arrows */}
                <path d="M3 9a9 9 0 0 1 15-3.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 15a9 9 0 0 1-15 3.7L3 16" />
                <path d="M3 21v-5h5" />
                {/* camera lens in the middle */}
                <circle cx="12" cy="12" r="2.4" />
              </svg>
            </button>
            <button
              type="button"
              className="btn btn-stop"
              onClick={stopCamera}
            >
              Stop
            </button>
          </>
        )}
      </footer>
    </div>
  )
}

export default App
