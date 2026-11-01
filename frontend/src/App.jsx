import { useEffect, useRef, useState } from 'react';
import './App.css';
import { loadYOLOModel, detectObjects } from './services/detectionService';
import { decodeYOLO } from './services/yoloDetaction';
import { drawDetections } from './services/drawDetections';


function App() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState('')

  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [detectionStatus, setDetectionStatus] = useState(
    'Loading AI model...'
  );
  const canvasRef = useRef(null)
  const [detectedObjects, setDetectedObjects] = useState([])


  // Add this effect to load the model once
  useEffect(() => {

    const initializeModel = async () => {
      try {
        await loadYOLOModel();

        setModelLoaded(true);
        setDetectionStatus('AI model ready');

      } catch (error) {

        console.error(error);

        setDetectionStatus('AI model failed to load');

      } finally {
        setModelLoading(false);
      }
    };

    initializeModel();

  }, []);


  // 'user' = front camera, 'environment' = back camera.
  const [facingMode, setFacingMode] = useState('user')

  // Keep the overlay canvas pixel size matched to the displayed video so
  // the boxes line up exactly with what the user sees.
  const syncCanvasSize = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const { clientWidth, clientHeight } = video
    if (
      clientWidth > 0 &&
      clientHeight > 0 &&
      (canvas.width !== clientWidth || canvas.height !== clientHeight)
    ) {
      canvas.width = clientWidth
      canvas.height = clientHeight
    }
  }

  // Add a detection loop
  useEffect(() => {
    if (!isActive || !modelLoaded) return

    let animationId
    let processing = false
    let lastRun = 0
    let cancelled = false

    const runDetection = async (timestamp) => {
      if (cancelled) return

      // Limit inference to approximately 6-7 FPS initially.
      if (
        timestamp - lastRun >= 150 &&
        !processing &&
        videoRef.current?.readyState >= 2
      ) {
        processing = true
        lastRun = timestamp

        try {
          const output = await detectObjects(videoRef.current)

          const detections = decodeYOLO(output)

          if (!cancelled) {
            setDetectedObjects(detections)

            syncCanvasSize()
            drawDetections(canvasRef.current, detections, {
              mirror: facingMode === 'user',
            })
          }

        } catch (error) {
          console.error('Detection error:', error)
        } finally {
          processing = false
        }
      }

      if (!cancelled) {
        animationId = requestAnimationFrame(runDetection)
      }
    }

    animationId = requestAnimationFrame(runDetection)

    // Capture the canvas node now so cleanup clears the right element.
    const canvasNode = canvasRef.current

    return () => {
      cancelled = true
      cancelAnimationFrame(animationId)
      setDetectedObjects([])
      drawDetections(canvasNode, [])
    }

  }, [isActive, modelLoaded, facingMode])

  // Stop any tracks currently held so the device can be reused. (fn)
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
        className={`camera-view ${isActive ? 'is-active' : ''} ${isFront ? 'is-front' : ''
          }`}
      >

        <div className="ai-status">
          {modelLoading
            ? 'Loading AI model...'
            : detectionStatus}
        </div>
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
        <div className="detection-info">
          <strong>Detected Objects</strong>

          {detectedObjects.length === 0 ? (
            <p>No objects detected</p>
          ) : (
            detectedObjects.map((item, index) => (
              <span key={`${item.classId}-${index}`}>
                {item.label} - {
                  (item.confidence * 100).toFixed(1)
                }%
              </span>
            ))
          )}
        </div>
        <canvas
          ref={canvasRef}
          className="detection-canvas"
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
