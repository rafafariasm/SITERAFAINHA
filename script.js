let currentSection = 1;
const totalSections = 9;

function showSection(sectionNumber) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(`section-${sectionNumber}`).classList.add('active');
    currentSection = sectionNumber;
    stopAllAudio();
}

function nextSection() {
    if (currentSection < totalSections) {
        showSection(currentSection + 1);
    }
}

function prevSection() {
    if (currentSection > 1) {
        showSection(currentSection - 1);
    }
}

function goToHome() {
    showSection(1);
}

function togglePlayPause(audioId) {
    const audio = document.getElementById(audioId);
    stopAllAudio(audio);
    
    const playButton = audio.parentElement.querySelector('.play-button');
    if (audio.paused) {
        audio.play();
        playButton.textContent = '⏸';
    } else {
        audio.pause();
        playButton.textContent = '▶';
    }
}

function stopAllAudio(exceptionAudio = null) {
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
        if (audio !== exceptionAudio) {
            audio.pause();
            audio.currentTime = 0;
            const playButton = audio.parentElement.querySelector('.play-button');
            if (playButton) playButton.textContent = '▶';
        }
    });
}

document.querySelectorAll('audio').forEach(audio => {
    const progressBar = audio.parentElement.querySelector('.progress-bar');
    const timeDisplay = audio.parentElement.querySelector('.time-display');
    const progressBarContainer = audio.parentElement.querySelector('.progress-bar-container');

    audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        timeDisplay.textContent = `0:00 / ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
        
        const currentMinutes = Math.floor(audio.currentTime / 60);
        const currentSeconds = Math.floor(audio.currentTime % 60);
        const durationMinutes = Math.floor(audio.duration / 60);
        const durationSeconds = Math.floor(audio.duration % 60);
        
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
    });

    audio.addEventListener('ended', () => {
        const playButton = audio.parentElement.querySelector('.play-button');
        if (playButton) playButton.textContent = '▶';
    });

    if (progressBarContainer) {
        progressBarContainer.addEventListener('click', (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * audio.duration;
            audio.currentTime = newTime;
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    showSection(1);
});
