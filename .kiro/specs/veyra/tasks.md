# Veyra — Implementation Tasks

**Version:** 1.0  
**Status:** Draft task plan  
**Rule:** Inspect the current repository before implementing. Reuse existing code and conventions; do not duplicate working functionality. Complete and test tasks in order. Do not treat this prototype as a safety device.

## Phase 0 — Repository inspection and setup

- [ ] 0.1 Inspect the existing repository, package manager, React/Vite setup, routing, styling, and current components.
- [ ] 0.2 Record existing functionality and identify gaps against `requirements.md`.
- [ ] 0.3 Confirm supported target devices and browsers for the hackathon demo.
- [ ] 0.4 Create or update the project README with prerequisites and local run instructions.
- [ ] 0.5 Add linting, formatting, and test scripts if they are not already present.

## Phase 1 — Accessible app foundation

- [ ] 1.1 Create the accessible application shell and responsive layout.
- [ ] 1.2 Add onboarding content explaining purpose, limitations, camera use, and mobility-aid safety notice.
- [ ] 1.3 Add primary session controls with accessible names and keyboard support.
- [ ] 1.4 Add an accessible status region for session and capability messages.
- [ ] 1.5 Add baseline English strings in a central location to support future localization.
- [ ] 1.6 Test layout, focus order, contrast, screen-reader labels, and mobile touch targets.

## Phase 2 — Camera lifecycle

- [ ] 2.1 Implement camera capability detection and permission request after explicit user action.
- [ ] 2.2 Implement camera session states: idle, requesting, ready, running, paused, error, stopped.
- [ ] 2.3 Prefer the rear-facing camera on mobile when supported, with a fallback to an available camera.
- [ ] 2.4 Render the live camera preview.
- [ ] 2.5 Implement pause, resume, and stop behavior.
- [ ] 2.6 Ensure all media tracks stop on session stop, error, and component unmount.
- [ ] 2.7 Handle denied permission, missing camera, camera-in-use, and interrupted stream states.
- [ ] 2.8 Add tests for camera state transitions and cleanup using mocked MediaDevices.

## Phase 3 — AI model integration

- [ ] 3.1 Evaluate compact YOLO model candidates for browser inference and document model license, source, classes, input dimensions, and limitations.
- [ ] 3.2 Select and export one model to ONNX with documented preprocessing and output format.
- [ ] 3.3 Add model metadata/configuration; do not hardcode assumptions about tensor shapes in unrelated modules.
- [ ] 3.4 Install and configure ONNX Runtime Web.
- [ ] 3.5 Implement model loading, readiness state, and recoverable model-load errors.
- [ ] 3.6 Implement preprocessing that matches the selected model's expected tensor format.
- [ ] 3.7 Implement and unit-test the selected model's output parser.
- [ ] 3.8 Normalize detections into the shared Detection data contract.
- [ ] 3.9 Benchmark inference on target devices and record measured latency and frame rate.

## Phase 4 — Frame sampling and detection display

- [ ] 4.1 Implement configurable frame sampling with a bounded inference queue.
- [ ] 4.2 Drop stale frames when inference is busy to prevent growing latency.
- [ ] 4.3 Move inference to a Web Worker where supported and validated; retain a tested fallback if needed.
- [ ] 4.4 Add confidence-threshold filtering.
- [ ] 4.5 Display detection labels and bounding boxes in an optional visual/debug mode.
- [ ] 4.6 Add an accessible text detection list/status that does not rely on visual overlays alone.
- [ ] 4.7 Test frame sampler behavior, stale-frame dropping, and detection normalization.

## Phase 5 — Direction zones

- [ ] 5.1 Implement configurable left/centre/right zone boundaries.
- [ ] 5.2 Classify detections using the horizontal centre of each normalized bounding box.
- [ ] 5.3 Add unit tests for boundary values and edge cases.
- [ ] 5.4 Ensure UI and spoken phrases describe camera-view position, not guaranteed physical direction.

## Phase 6 — Alerts, speech, and vibration

- [ ] 6.1 Define a small, reviewed set of high-priority object classes and alert messages for the demo.
- [ ] 6.2 Implement alert candidate creation and configurable priority rules.
- [ ] 6.3 Implement deduplication and cooldown to prevent repeated announcements.
- [ ] 6.4 Implement pre-emption of lower-priority queued alerts.
- [ ] 6.5 Implement speech adapter using Web Speech API with feature detection and graceful failure.
- [ ] 6.6 Add voice enable/disable and speech-rate settings.
- [ ] 6.7 Implement vibration adapter using Vibration API with feature detection.
- [ ] 6.8 Add vibration enable/disable setting and documented alert patterns.
- [ ] 6.9 Connect alert manager to speech and vibration adapters.
- [ ] 6.10 Test priority, cooldown, deduplication, pre-emption, speech fallback, and vibration fallback.

## Phase 7 — Settings and PWA

- [ ] 7.1 Build accessible settings for voice, vibration, speech rate, confidence threshold, and inference rate.
- [ ] 7.2 Validate setting ranges and apply changes without restarting the app unnecessarily.
- [ ] 7.3 Persist only non-sensitive preferences locally if needed; never persist frames/audio.
- [ ] 7.4 Configure PWA manifest, app icons, and installability where supported.
- [ ] 7.5 Verify HTTPS deployment requirements for camera access.
- [ ] 7.6 Test responsive behavior and install flow on target devices.

## Phase 8 — Quality, privacy, and demo readiness

- [ ] 8.1 Verify there is no camera-frame or audio upload in the MVP network flow.
- [ ] 8.2 Review dependencies, remove unused packages, and ensure no secrets are committed.
- [ ] 8.3 Run unit, component, integration, and end-to-end tests.
- [ ] 8.4 Test permission denial, missing camera, model failure, inference failure, and unsupported speech/vibration.
- [ ] 8.5 Conduct controlled object-detection tests across lighting, motion, occlusion, and camera angles.
- [ ] 8.6 Record false positives, false negatives, latency, frame rate, battery/heat observations, and device/browser compatibility.
- [ ] 8.7 Test with accessibility tools and, where possible, obtain feedback from blind/low-vision users with appropriate consent and supervision.
- [ ] 8.8 Add clear prototype limitations and safety disclaimer to the app and demo presentation.
- [ ] 8.9 Prepare a repeatable hackathon demo script using a controlled environment; do not demo near traffic or other hazards.
- [ ] 8.10 Update README with architecture, setup, model provenance/license, supported browsers, known limitations, and troubleshooting.

## Phase 9 — Optional post-MVP features (only after MVP is stable)

- [ ] 9.1 Design and implement explicit object-finding mode for supported classes.
- [ ] 9.2 Design user-triggered OCR/text reading and test recognition uncertainty handling.
- [ ] 9.3 Add Bengali and Hindi localization only after verifying available speech voices on target devices.
- [ ] 9.4 Evaluate a validated qualitative proximity/depth method; do not expose metric distance unless independently validated.
- [ ] 9.5 Reassess whether a FastAPI backend is necessary for a defined non-camera requirement.
- [ ] 9.6 Define consent, privacy, reliability, and regional requirements before any emergency contact/location feature.

## Definition of done

A task is complete only when its code is integrated, relevant tests pass, errors and unsupported capabilities are handled, accessibility is considered, and documentation is updated where behavior or setup changes. A feature is not complete merely because it works on the developer's machine.
