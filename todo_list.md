# Implementation Task List

## Audio Improvements
- [ ] Implement audible sound using expo-av (create AudioEngineExpo.ts)
- [ ] Update useAudioEngine to track fallback mode and expose usingFallback
- [ ] Add warning toast when fallback is used

## PerformanceGrid Improvements  
- [ ] Make PerformanceGrid interactive with touch handling using Skia onTouch
- [ ] Add TouchableOpacity overlay for hit-testing

## Store Integration
- [ ] Update MusicKey.tsx to call addActiveNote/removeActiveNote

## Gesture Memoization
- [ ] Wrap gesture in useMemo in NoteCircle.tsx

## useFrameCallback Cleanup
- [ ] Add cleanup in RippleEffect's useFrameCallback

## Latency Calibration
- [ ] Improve CalibrationWizard with two-tap method
- [ ] Add Android route detection stub in useLatency.ts

## Dead Code Cleanup
- [ ] Remove unused handlers in PianoCircles.tsx

## Fallback Warning
- [ ] Add warning toast in AudioInitStatus.tsx when using fallback
