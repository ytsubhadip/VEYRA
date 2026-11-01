# Veyra — Requirements Specification

**Version:** 1.0  
**Status:** Draft for review  
**Product type:** Accessible, camera-based web application / PWA

## 1. Product overview

Veyra is an AI-powered visual assistance web application intended to help blind and low-vision users become more aware of nearby objects and potential obstacles. The application uses a device camera, on-device object detection where supported, and concise audio and vibration feedback. It is an awareness aid, not a replacement for a white cane, guide dog, mobility training, or human assistance.

## 2. Goals

- Let a user start and stop a live camera assistance session with clear, accessible controls.
- Detect supported objects in camera frames and communicate useful information without overwhelming the user.
- Estimate whether detected objects are to the left, centre, or right of the camera view.
- Provide concise voice warnings and optional vibration patterns for relevant detections.
- Make the primary workflow usable with screen readers, keyboard navigation, and large touch targets.
- Process camera frames locally by default; do not transmit or store camera imagery unless a future feature explicitly requires it and the user consents.

## 3. Out of scope for the initial release

- Guaranteed collision avoidance or certified navigation assistance.
- Precise metric distance measurement using a monocular camera.
- Turn-by-turn outdoor navigation or indoor mapping.
- Emergency dispatch or automatic contacting of emergency services.
- Continuous cloud video streaming, face recognition, identity recognition, or biometric identification.
- Claims that the system can reliably identify every obstacle or guarantee user safety.

## 4. User roles

- **Primary user:** A blind or low-vision person using the application on a compatible smartphone.
- **Maintainer/developer:** Configures the detection model, supported classes, application settings, and releases.

No account is required for the first prototype unless later product decisions establish a clear need.

## 5. Functional requirements

### REQ-1: Accessible onboarding and safety notice

1. The application shall explain its purpose, limitations, camera use, and the need to continue using established mobility aids.
2. The application shall explain how to start and stop assistance and how voice/vibration feedback works.
3. The application shall provide an accessible way to select or enable audio and vibration feedback.
4. The application shall not imply that the system guarantees obstacle detection or safe passage.

### REQ-2: Camera permission and session control

1. The application shall request camera access only after the user initiates the camera feature.
2. If permission is denied or unavailable, the application shall explain the problem and provide a retry path.
3. The user shall be able to start, pause, resume, and stop a camera session.
4. The application shall visibly and accessibly communicate camera/session state.
5. Stopping a session shall stop active media tracks and release camera resources.
6. The application shall handle unsupported browsers, missing cameras, and camera errors gracefully.

### REQ-3: Real-time object detection

1. While a session is active, the application shall sample camera frames at a configurable rate suitable for the device.
2. The application shall run the configured object-detection model and obtain class labels, confidence scores, and bounding boxes.
3. The application shall filter detections using configurable confidence thresholds.
4. The application shall show an understandable unavailable/loading/error state when the model cannot be loaded or run.
5. The application shall avoid blocking the interface while inference is running.
6. The application shall not claim that an undetected object is absent.

### REQ-4: Direction / screen-zone classification

1. The application shall divide the camera view into left, centre, and right zones.
2. The application shall classify each detection using the horizontal centre of its bounding box.
3. The application shall make zone boundaries configurable and testable.
4. The application shall describe the result as the object's position in the camera view, not a guaranteed physical direction of travel.

### REQ-5: Proximity indication

1. The initial release may provide a qualitative proximity category only when a validated estimation method is available.
2. The application shall clearly label camera-based proximity as approximate.
3. If reliable proximity cannot be estimated, the application shall omit distance claims rather than invent a distance.
4. The application shall not present monocular bounding-box size as an accurate metric distance measurement.

### REQ-6: Voice feedback

1. The application shall announce selected high-priority detections using concise phrases, such as “Person ahead” or “Obstacle on your left”.
2. The application shall allow voice feedback to be enabled or disabled.
3. The application shall avoid repeating the same announcement continuously while a detection remains unchanged.
4. The application shall prioritize important warnings over low-priority object descriptions.
5. The application shall provide a way to adjust speech rate and, where supported, voice/language.
6. If speech synthesis is unavailable, the application shall communicate that limitation and keep other supported feedback available.

### REQ-7: Vibration feedback

1. The application shall offer optional vibration feedback on devices/browser contexts that support it.
2. The application shall use distinct, documented vibration patterns for configured alert levels.
3. The user shall be able to disable vibration.
4. If vibration is unsupported or blocked, the application shall continue without crashing and explain the limitation accessibly.

### REQ-8: Alert prioritization and repetition control

1. The application shall rank alerts using configured factors such as object class, confidence, image zone, and supported proximity signal.
2. The application shall announce the most relevant alert first when several detections occur together.
3. The application shall apply a cooldown/deduplication window to prevent alert flooding.
4. The application shall allow a newly detected higher-priority alert to supersede a lower-priority queued alert.
5. Alert rules shall be configurable and covered by tests.

### REQ-9: Object-finding mode (post-MVP)

1. The user may choose a supported object category to search for.
2. The application shall announce when the selected category is detected and its camera-view zone.
3. The application shall clearly state when the selected object is not currently detected rather than implying it is not present in the environment.

### REQ-10: OCR / text reading (post-MVP)

1. The user may explicitly request text reading from a captured frame.
2. The application shall present recognized text through speech and accessible on-screen text.
3. The application shall indicate that OCR can be inaccurate and allow the user to repeat or cancel.
4. OCR shall not run continuously by default.

### REQ-11: Language support (post-MVP)

1. The application shall keep user-facing strings and spoken alert phrases localizable.
2. The first release shall define English as the baseline language.
3. Additional Bengali and Hindi speech shall be enabled only where the browser/device provides suitable speech voices and the feature has been tested.

### REQ-12: Privacy and data handling

1. Camera access shall require explicit browser permission.
2. Camera frames shall be processed locally by default.
3. The application shall not save or upload camera frames, audio, or detection history by default.
4. The application shall not include face recognition or identify people.
5. Any future remote processing or data retention feature shall require an explicit product decision, clear notice, and user consent.

### REQ-13: PWA and device compatibility

1. The application shall be installable as a PWA where supported.
2. The interface shall adapt to common mobile screen sizes and orientations.
3. The application shall check for required browser APIs and provide graceful fallbacks.
4. Camera access shall be used in secure contexts (HTTPS or localhost).
5. The application shall communicate that browser, device, model, and battery performance can vary.

## 6. Non-functional requirements

- **Accessibility:** Semantic HTML, keyboard operation, screen-reader labels, visible focus, sufficient contrast, scalable text, and large touch targets.
- **Performance:** Inference rate and frame sampling shall be configurable; UI rendering must remain responsive on target test devices.
- **Reliability:** Camera/model/API failures must produce recoverable states rather than an unhandled crash.
- **Privacy:** Local-first processing and data minimization are defaults.
- **Maintainability:** Detection, alert prioritization, speech, vibration, and camera handling shall be separated into testable modules.
- **Security:** Dependencies shall be maintained; no secrets shall be committed to the repository; any future API shall validate inputs and use HTTPS in deployment.

## 7. Acceptance criteria for MVP

- A user can open the app on a supported HTTPS mobile browser, read/hear the safety notice, grant camera permission, and start/stop a session.
- The camera preview works and camera tracks are released on stop.
- A supported model can run inference on sampled frames and produce class, confidence, and bounding-box results.
- Detected objects are classified into left/centre/right camera-view zones.
- A configured high-priority detection can trigger a concise voice alert and optional vibration.
- Repeated detections are rate-limited and higher-priority alerts take precedence.
- Permission denial, unsupported APIs, model-loading failure, and inference failure are handled gracefully.
- The primary controls are usable by keyboard and screen reader.
- Camera frames are not uploaded or persisted by the MVP.
- User testing documents missed detections, false positives, latency, device compatibility, and safety limitations.

## 8. Risks and assumptions

- Object detection can miss objects or produce false positives, especially in poor lighting, motion blur, occlusion, or unfamiliar environments.
- A phone camera has a limited field of view and may not detect hazards outside the frame.
- Browser support for camera, speech, vibration, and background execution varies by device.
- On-device inference may cause battery drain, heat, or low frame rates.
- Qualitative proximity estimates are unreliable without validated depth sensing; metric distance is not an MVP promise.
- The prototype must be tested in controlled settings and must not be marketed as a safety guarantee.
