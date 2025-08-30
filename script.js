let currentSection = 1;
const totalSections = 9;

// Função para mostrar a seção
function showSection(sectionNumber) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(`section-${sectionNumber}`).classList.add('active');
    currentSection = sectionNumber;
    stopAllAudio(); // Para o áudio ao mudar de seção
}

// Funções de navegação
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

// Controle de Áudio
function playAudio(audioId) {
    const audio = document.getElementById(audioId);
    stopAllAudio(audio); // Para outros áudios
    
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

function stopAllAudio(exceptionAudio = null) {
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
        if (audio !== exceptionAudio) {
            audio.pause();
            audio.currentTime = 0;
            const playButton = audio.parentElement.querySelector('button');
            if (playButton) playButton.textContent = '▶';
        }
    });
}

// Atualiza a barra de progresso e o tempo
document.querySelectorAll('audio').forEach(audio => {
    const progressBar = audio.parentElement.querySelector('.progress-bar');
    const timeDisplay = audio.parentElement.querySelector('.time-display');
    const playButton = audio.parentElement.querySelector('button');

    audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        timeDisplay.textContent = `0:00 / ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        const currentMinutes = Math.floor(audio.currentTime / 60);
        const currentSeconds = Math.floor(audio.currentTime % 60);
        const durationMinutes = Math.floor(audio.duration / 60);
        const durationSeconds = Math.floor(audio.duration % 60);
        
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
    });

    audio.addEventListener('play', () => {
        if (playButton) playButton.textContent = '⏸';
    });

    audio.addEventListener('pause', () => {
        if (playButton) playButton.textContent = '▶';
    });

    audio.addEventListener('ended', () => {
        if (playButton) playButton.textContent = '▶';
    });

    // Clicar na barra de progresso para mudar o tempo
    const progressBarContainer = audio.parentElement.querySelector('.progress-bar-container');
    if (progressBarContainer) {
        progressBarContainer.addEventListener('click', (e) => {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * audio.duration;
            audio.currentTime = newTime;
        });
    }
});

// Inicializa a primeira seção
document.addEventListener('DOMContentLoaded', () => {
    showSection(1);
});
