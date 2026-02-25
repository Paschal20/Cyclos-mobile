# Sine Wave Audio File Required

This folder requires a sine wave audio file for the expo-av audio engine.

## Required File
- **Filename:** sine_440.wav
- **Format:** WAV (PCM)
- **Sample Rate:** 44100 Hz
- **Channels:** Mono
- **Bit Depth:** 16-bit
- **Frequency:** 440 Hz (A4 note)
- **Duration:** 1 second (can be shorter)

## How to Generate

### Option 1: Online Generator
Use an online sine wave generator like:
- https://www.soundjay.com/tone-generator/
- Set frequency to 440 Hz, duration to 1 second, export as WAV

### Option 2: Audacity
1. Download Audacity (https://www.audacityteam.org/)
2. Go to Generate > Tone
3. Set:
   - Frequency: 440 Hz
   - Amplitude: 0.8
   - Duration: 1 second
4. Go to File > Export > Export as WAV
5. Save as "sine_440.wav" in this folder

### Option 3: Command Line (macOS/Linux)
```bash
sox -n -r 44100 -c 1 sine_440.wav synth 1 sine 440
```

### Option 4: Python
```python
import numpy as np
import wave

sample_rate = 44100
duration = 1.0
frequency = 440

t = np.linspace(0, duration, int(sample_rate * duration))
samples = (np.sin(2 * np.pi * frequency * t) * 32767).astype(np.int16)

with wave.open('sine_440.wav', 'w') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    wav_file.writeframes(samples.tobytes())
```

## Why This File is Needed
The expo-av audio engine uses this 440Hz sine wave as a base sample.
When you play a note, the engine adjusts the playback rate to produce
the desired frequency. This allows multiple notes from a single audio file.
