// Audio visualization app for deaf people
let audioContext;
let analyser;
let microphone;
let dataArray;
let bufferLength;
let animationId;
let isListening = false;

// DOM elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');
const levelFill = document.getElementById('levelFill');
const levelText = document.getElementById('levelText');
const alertBox = document.getElementById('alertBox');
const alertIcon = document.getElementById('alertIcon');
const alertText = document.getElementById('alertText');

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Start listening
startBtn.addEventListener('click', async () => {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create audio context and analyser
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 2048;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        microphone.connect(analyser);
        
        isListening = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.textContent = '✅ Listening to audio...';
        statusText.style.color = '#10b981';
        
        // Start visualization
        visualize();
    } catch (error) {
        console.error('Error accessing microphone:', error);
        statusText.textContent = '❌ Error: Could not access microphone';
        statusText.style.color = '#ef4444';
        alert('Please allow microphone access to use this app.');
    }
});

// Stop listening
stopBtn.addEventListener('click', () => {
    stopListening();
});

function stopListening() {
    isListening = false;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (microphone) {
        microphone.disconnect();
    }
    
    if (audioContext) {
        audioContext.close();
    }
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = 'Click "Start Listening" to begin';
    statusText.style.color = '#666';
    
    // Reset displays
    canvasCtx.fillStyle = '#000';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    levelFill.style.width = '0%';
    levelText.textContent = 'Volume: 0%';
    alertBox.className = 'alert-box';
    alertIcon.textContent = '🔊';
    alertText.textContent = 'Listening for sounds...';
}

// Visualize audio
function visualize() {
    if (!isListening) return;
    
    animationId = requestAnimationFrame(visualize);
    
    // Get frequency data
    analyser.getByteTimeDomainData(dataArray);
    
    // Draw waveform
    canvasCtx.fillStyle = '#000';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#667eea';
    canvasCtx.beginPath();
    
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
    
    // Calculate volume level
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        const value = Math.abs(dataArray[i] - 128);
        sum += value;
    }
    const average = sum / bufferLength;
    const volumePercent = Math.min(100, (average / 128) * 100 * 3); // Scale for better visibility
    
    // Update level bar
    levelFill.style.width = volumePercent + '%';
    levelText.textContent = `Volume: ${Math.round(volumePercent)}%`;
    
    // Update alert based on volume
    updateAlert(volumePercent);
}

function updateAlert(volume) {
    alertBox.className = 'alert-box';
    
    if (volume < 30) {
        alertBox.classList.add('alert-quiet');
        alertIcon.textContent = '🟢';
        alertText.textContent = 'Quiet - Low Sound Level';
    } else if (volume < 60) {
        alertBox.classList.add('alert-moderate');
        alertIcon.textContent = '🟡';
        alertText.textContent = 'Moderate - Normal Sound Level';
    } else if (volume < 85) {
        alertBox.classList.add('alert-loud');
        alertIcon.textContent = '🟠';
        alertText.textContent = 'Loud - High Sound Level';
    } else {
        alertBox.classList.add('alert-very-loud');
        alertIcon.textContent = '🔴';
        alertText.textContent = 'VERY LOUD - Intense Sound Detected!';
    }
}

// Initialize
console.log('KRASH Audio Visualizer loaded');
