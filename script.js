const sections = document.querySelectorAll('.section');
const playButtons = document.querySelectorAll('.play-button');
const progressBars = document.querySelectorAll('.progress-bar');
const timeDisplays = document.querySelectorAll('.time-display');
const audio = new Audio();
let currentAudioIndex = -1;
let isPlaying = false;

function navigate(targetSection) {
    const currentSection = document.querySelector('.section-visible');
    const newSection = document.getElementById(`section${targetSection}`);
    
    if (currentSection) {
        currentSection.classList.remove('section-visible');
    }
    if (newSection) {
        newSection.classList.add('section-visible');
    }

    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playButtons[currentAudioIndex].innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    }
}

// Player de Música
playButtons.forEach((button, index) => {
    const progressBar = progressBars[index];
    const timeDisplay = timeDisplays[index];

    button.addEventListener('click', () => {
        const src = button.dataset.src;
        
        if (audio.paused && currentAudioIndex === index) {
            audio.play();
            button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            isPlaying = true;
        } else {
            if (isPlaying) {
                audio.pause();
                playButtons[currentAudioIndex].innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
            }
            if (currentAudioIndex !== index) {
                audio.src = src;
                audio.load();
                audio.play();
                currentAudioIndex = index;
                button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                isPlaying = true;
            }
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (currentAudioIndex === index) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progress}%`;
            
            const formatTime = (time) => {
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            };
            timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });
    
    audio.addEventListener('ended', () => {
        if (currentAudioIndex === index) {
            button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
            isPlaying = false;
            audio.currentTime = 0;
        }
    });
});
