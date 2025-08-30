// Verificar preferência de redução de movimento
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Controlador de Áudio
class AudioController {
    constructor() {
        this.players = document.querySelectorAll('.audio-player');
        this.currentAudio = null;
        this.initPlayers();
    }

    initPlayers() {
        this.players.forEach(player => {
            const audioElement = player.querySelector('audio');
            const playButton = player.querySelector('.play-button');
            const progressBar = player.querySelector('.progress-fill');
            const progressContainer = player.querySelector('.progress-bar');
            const currentTimeDisplay = player.querySelector('.current-time');
            const durationDisplay = player.querySelector('.duration');

            // Carregar duração quando os metadados estiverem disponíveis
            audioElement.addEventListener('loadedmetadata', () => {
                durationDisplay.textContent = this.formatTime(audioElement.duration);
            });

            // Atualizar progresso durante a reprodução
            audioElement.addEventListener('timeupdate', () => {
                const progress = (audioElement.currentTime / audioElement.duration) * 100;
                progressBar.style.width = `${progress}%`;
                currentTimeDisplay.textContent = this.formatTime(audioElement.currentTime);
                
                // Salvar posição no sessionStorage
                if (audioElement === this.currentAudio) {
                    sessionStorage.setItem(`audio-${audioElement.id}-position`, audioElement.currentTime);
                }
            });

            // Controle de clique na barra de progresso
            progressContainer.addEventListener('click', (e) => {
                if (audioElement === this.currentAudio) {
                    const rect = progressContainer.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    audioElement.currentTime = pos * audioElement.duration;
                }
            });

            // Controle de play/pause
            playButton.addEventListener('click', () => {
                if (audioElement === this.currentAudio && !audioElement.paused) {
                    this.pauseAudio();
                } else {
                    this.playAudio(audioElement, playButton);
                }
            });

            // Restaurar posição se existir no sessionStorage
            const savedPosition = sessionStorage.getItem(`audio-${audioElement.id}-position`);
            if (savedPosition) {
                audioElement.currentTime = parseFloat(savedPosition);
            }

            // Quando o áudio terminar
            audioElement.addEventListener('ended', () => {
                playButton.classList.remove('playing');
                progressBar.style.width = '0%';
                audioElement.currentTime = 0;
                this.currentAudio = null;
                sessionStorage.removeItem(`audio-${audioElement.id}-position`);
            });
        });
    }

    playAudio(audio, button) {
        // Pausar áudio atual se existir
        if (this.currentAudio && this.currentAudio !== audio) {
            this.pauseAudio();
        }

        // Reproduzir novo áudio
        audio.play().then(() => {
            this.currentAudio = audio;
            button.classList.add('playing');
        }).catch(error => {
            console.error('Erro ao reproduzir áudio:', error);
        });
    }

    pauseAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            const button = document.querySelector(`[data-audio="${this.currentAudio.id}"]`);
            button.classList.remove('playing');
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
}

// Navegação entre seções
class Navigation {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.prevButton = document.querySelector('.prev-section');
        this.nextButton = document.querySelector('.next-section');
        this.menuFab = document.querySelector('.menu-fab');
        this.mobileMenu = document.querySelector('.mobile-menu');
        this.currentSectionIndex = 0;
        
        this.initNavigation();
    }

    initNavigation() {
        // Botões de navegação
        this.prevButton.addEventListener('click', () => this.navigateToSection('prev'));
        this.nextButton.addEventListener('click', () => this.navigateToSection('next'));

        // Menu mobile
        this.menuFab.addEventListener('click', () => {
            this.menuFab.classList.toggle('active');
            this.mobileMenu.classList.toggle('active');
        });

        // Fechar menu ao clicar em um link
        this.mobileMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.menuFab.classList.remove('active');
                this.mobileMenu.classList.remove('active');
            });
        });

        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                this.navigateToSection('next');
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                this.navigateToSection('prev');
            }
        });

        // Observar seções visíveis para atualizar navegação
        this.setupIntersectionObserver();
    }

    navigateToSection(direction) {
        if (direction === 'next' && this.currentSectionIndex < this.sections.length - 1) {
            this.currentSectionIndex++;
        } else if (direction === 'prev' && this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
        }

        const targetSection = this.sections[this.currentSectionIndex];
        targetSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateActiveNavLink(sectionId);
                    
                    // Atualizar índice da seção atual
                    this.currentSectionIndex = Array.from(this.sections).findIndex(section => section.id === sectionId);
                    
                    // Carregar YouTube iframe quando a seção de vídeo estiver visível
                    if (sectionId === 'p9') {
                        this.loadYouTubeVideo();
                    }
                }
            });
        }, options);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    updateActiveNavLink(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    loadYouTubeVideo() {
        const videoPlaceholder = document.querySelector('.video-placeholder');
        if (videoPlaceholder && !videoPlaceholder.dataset.loaded) {
            const youtubeId = videoPlaceholder.dataset.youtubeId;
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            videoPlaceholder.appendChild(iframe);
            videoPlaceholder.dataset.loaded = 'true';
            
            // Esconder o botão de play
            const playButton = videoPlaceholder.querySelector('.video-play-button');
            if (playButton) {
                playButton.style.display = 'none';
            }
        }
    }
}

// Lightbox para galeria
class Lightbox {
    constructor() {
        this.lightbox = document.querySelector('.lightbox');
        this.lightboxImage = this.lightbox.querySelector('img');
        this.closeButton = this.lightbox.querySelector('.lightbox-close');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        
        this.initLightbox();
    }

    initLightbox() {
        // Abrir lightbox ao clicar em uma imagem da galeria
        this.galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgSrc = item.querySelector('img').src;
                this.openLightbox(imgSrc);
            });
        });

        // Fechar lightbox ao clicar no botão de fechar
        this.closeButton.addEventListener('click', () => {
            this.closeLightbox();
        });

        // Fechar lightbox ao pressionar ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
                this.closeLightbox();
            }
        });

        // Fechar lightbox ao clicar fora da imagem
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
    }

    openLightbox(imgSrc) {
        this.lightboxImage.src = imgSrc;
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impedir rolagem
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar rolagem
    }
}

// Animações de revelação
class RevealAnimations {
    constructor() {
        this.revealElements = document.querySelectorAll('.reveal');
        this.initReveal();
    }

    initReveal() {
        if (prefersReducedMotion) {
            // Se o usuário prefere movimento reduzido, mostrar todos os elementos imediatamente
            this.revealElements.forEach(el => {
                el.classList.add('visible');
            });
            return;
        }

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Parar de observar após revelar
                }
            });
        }, options);

        this.revealElements.forEach(el => {
            observer.observe(el);
        });
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const audioController = new AudioController();
    const navigation = new Navigation();
    const lightbox = new Lightbox();
    const revealAnimations = new RevealAnimations();

    // Inicializar botão de play do vídeo
    const videoPlayButton = document.querySelector('.video-play-button');
    if (videoPlayButton) {
        videoPlayButton.addEventListener('click', () => {
            navigation.loadYouTubeVideo();
        });
    }
});
