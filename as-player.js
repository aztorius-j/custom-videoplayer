// VARIABLES, CONSTANTS
const   video = document.getElementById('video'),
        title = document.querySelector('h2'),
        muteButton = document.querySelector('.mute-button'),
        playButton = document.querySelectorAll('.play-button'),
        volumeOn = Array.from(document.querySelectorAll('.volume')),
        volumeOff = document.querySelector('.volume-mute'),
        smallPlayer = document.querySelector('.small-player'),
        forward = document.querySelector('.forward'),
        backward = document.querySelector('.backward'),
        youtubeLinks = document.querySelectorAll('.ytb-link a'),
        posters = Array.from(document.querySelectorAll('.poster')),
        sliderButtons = Array.from(document.querySelectorAll('.circle')),
        playIcons = Array.from(document.querySelectorAll('.play-icon')),
        pauseIcons = Array.from(document.querySelectorAll('.pause-icon'));

let     firstMovie, secondMovie, thirdMovie;
let     activeIndex = 0;
let     sliderInterval;

// FETCH
async function fetchMovies() {
    try {
        const response = await fetch('music-composition.json');
        const data = await response.json();

        firstMovie = data[0];
        secondMovie = data[1];
        thirdMovie = data[2];

        visualInitialize();
        changeContent();
        startSlider();
    }
    catch (error) {
        console.error('Error loading JSON:', error);
    }
}

fetchMovies();
manualChange();

// VISUAL INITIALIZE
function visualInitialize() {
    paused();
    soundOn();
    const   movies = [firstMovie, secondMovie, thirdMovie];
    posters.forEach((poster, index) => {
        poster.style.background = `url(${movies[index].poster}) 0 0 / contain no-repeat`;
    });
}

// CHANGE CONTENT
function changeContent() {
    const   movies = [firstMovie, secondMovie, thirdMovie];
    
        posters.forEach((poster, index) => {
            poster.classList.remove('fade-in', 'fade-out');

            if (index === activeIndex) {
                poster.style.zIndex = 2;
                poster.classList.add('fade-in');
            } else {
                poster.style.zIndex = 1;
                poster.classList.add('fade-out');
            }
        });

        video.pause();
        video.src = movies[activeIndex].source;
        video.load();
        title.textContent = movies[activeIndex].title;

        sliderButtons.forEach(slide => {
            slide.classList.remove('full');
            sliderButtons[activeIndex].classList.add('full');
        });

        youtubeLinks.forEach(link => {
            link.setAttribute('href', movies[activeIndex].youtube);
        });
}

// START SLIDER
function startSlider() {
    sliderInterval = setInterval(() => {
        activeIndex = (activeIndex + 1) % 3;
        changeContent();
    }, 5000);
}

// STOP SLIDER
function stopSlider() {
    clearInterval(sliderInterval);
}

// PLAY
playButton.forEach(play => {
    play.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playing();
            stopSlider();
            posters.forEach(poster => {
                poster.style.zIndex = 0;
            });
        }
        else {
            video.pause();
            paused();
        }
    });
    youtubeLinks.forEach(link => {
        link.addEventListener('click', event => {
            if (!video.paused && !video.ended) {
                video.pause();
                paused();
            }
        });
    });
});

video.addEventListener('ended', () => {
    paused();
    startSlider();
});

// MUTE
muteButton.addEventListener('click', () => {
    video.muted = !video.muted;
    
    if (video.muted) {
        muted();
    } else {
        soundOn();
    }
});

// MANUAL CHANGE
function manualChange() {
    sliderButtons.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (index !== activeIndex) {
                paused();
                stopSlider();
                activeIndex = index;
                changeContent();
                startSlider();
            }
        });
    });
    forward.addEventListener('click', () => {
        paused();
        stopSlider();
        activeIndex = activeIndex < 2 ? activeIndex + 1 : 0;
        changeContent();
        startSlider();
    });
    backward.addEventListener('click', () => {
        paused();
        stopSlider();
        activeIndex = activeIndex === 0 ? 2 : activeIndex - 1;
        changeContent();
        startSlider();
    });
}

// PLAYER ICONS CHANGE
function playing() {
    playIcons.forEach(playIcon => {
        playIcon.style.display = 'none';
    });
    pauseIcons.forEach(pauseIcon => {
        pauseIcon.style.display = 'inline';
    });
    smallPlayer.style.opacity = 0.2;
}

function paused() {
    playIcons.forEach(playIcon => {
        playIcon.style.display = 'inline';
    });
    pauseIcons.forEach(pauseIcon => {
        pauseIcon.style.display = 'none';
    });
    smallPlayer.style.opacity = 1;
}

function muted() {
    volumeOn.forEach(soundIcon => {
        soundIcon.style.display = 'none';
    });
    volumeOff.style.display = 'inline';
}

function soundOn() {
    volumeOn.forEach(soundIcon => {
        soundIcon.style.display = 'inline';
    });
    volumeOff.style.display = 'none';
}


