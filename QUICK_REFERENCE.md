
# Quick Reference

## Key Commands
```bash
npm test              # Run tests
npx expo start        # Start dev server
npx expo prebuild     # Generate native dirs
```

## Key Files
| File | Purpose |
|------|---------|
| src/hooks/useAudioEngine.ts | Audio playback control |
| src/components/keys/NoteCircle.tsx | Interactive note component |
| src/lib/math.ts | MIDI/Frequency conversion |
| src/store/useAppStore.ts | Global state management |

## Audio Latency Tuning
1. Open Settings > Calibrate Audio
2. Tap when you hear the beep
3. System measures: t_touch - t_emitted - 150ms (reaction)
4. Saves offset for future sessions
