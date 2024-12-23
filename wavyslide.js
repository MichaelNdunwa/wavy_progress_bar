const waveContainer = document.getElementById('waveContainer');
    const wavePath = document.getElementById('wavePath');
    const progressMask = document.getElementById('progressMask');
    const timeDisplay = document.getElementById('timeDisplay');
    const playButton = document.getElementById('playButton');
    
    // Audio context setup
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let audio = new Audio();
    audio.crossOrigin = "anonymous";
    // Using a sample audio file - replace with your actual audio file
    // audio.src = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
    audio.src = "music/lofi.mp3";
    
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    let animationId;
    let isPlaying = false;

    function drawWave() {
      const width = waveContainer.clientWidth;
      const height = waveContainer.clientHeight;
      
      analyser.getByteFrequencyData(dataArray);
      
      let path = `M 0 ${height/2}`;
      const sliceWidth = width / bufferLength;
      
      for(let i = 0; i < bufferLength; i++) {
        const x = i * sliceWidth;
        const v = dataArray[i] / 128.0;
        // const y = v * height/2;
        const y = v * height/12;
        
        path += ` L ${x} ${height/2 + y}`;
      }
      
      for(let i = bufferLength-1; i >= 0; i--) {
        const x = i * sliceWidth;
        const v = dataArray[i] / 128.0;
        // const y = v * height/2;
        const y = v * height/12;
        
        path += ` L ${x} ${height/2 - y}`;
      }
      
      path += ' Z';
      wavePath.setAttribute('d', path);
      
      // Update progress mask
      const progress = (audio.currentTime / audio.duration) * 100;
      progressMask.style.width = `${100 - progress}%`;
      progressMask.style.left = `${progress}%`;
      
      // Update time display
      const currentTime = formatTime(audio.currentTime);
      const duration = formatTime(audio.duration);
      timeDisplay.textContent = `${currentTime} / ${duration}`;
      
      animationId = requestAnimationFrame(drawWave);
    }

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    waveContainer.addEventListener('click', (e) => {
      const rect = waveContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      
      audio.currentTime = percentage * audio.duration;
    });

    playButton.addEventListener('click', () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      if (isPlaying) {
        audio.pause();
        cancelAnimationFrame(animationId);
      } else {
        audio.play();
        drawWave();
      }
      
      isPlaying = !isPlaying;
    });

    // Initial wave draw
    analyser.getByteFrequencyData(dataArray);
    drawWave();