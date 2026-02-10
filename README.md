# KRASH - Audio Visualizer for Deaf People

Beyond Binary Hackathon Project

## About

KRASH is a web-based audio visualization tool designed to help deaf people "see" sounds through real-time visual feedback. The application captures audio from the microphone and translates it into multiple visual representations, making sound accessible to the deaf community.

## Features

- **Real-time Audio Waveform**: Visual representation of sound waves
- **Volume Level Indicator**: Dynamic bar showing sound intensity
- **Color-Coded Alerts**: Different colors for various sound levels
  - 🟢 Green: Quiet (0-30%)
  - 🟡 Yellow: Moderate (30-60%)
  - 🟠 Orange: Loud (60-85%)
  - 🔴 Red: Very Loud (85-100%)
- **Accessible Design**: Clear, easy-to-understand interface
- **No Installation Required**: Runs directly in web browsers

## How to Use

1. Open `index.html` in a modern web browser
2. Click "Start Listening" to begin audio capture
3. Allow microphone access when prompted
4. Watch the visual feedback respond to sounds around you
5. Click "Stop Listening" when done

## Technology Stack

- HTML5
- CSS3
- JavaScript (Web Audio API)
- Canvas API for waveform visualization

## Browser Compatibility

Works with any modern browser that supports:
- Web Audio API
- getUserMedia API
- Canvas

Recommended browsers: Chrome, Firefox, Edge, Safari (latest versions)

## Accessibility

This application is specifically designed for the deaf community, providing visual feedback that replaces audio cues. All information is conveyed through visual means including colors, animations, and text.

## License

Open source project for Beyond Binary Hackathon
