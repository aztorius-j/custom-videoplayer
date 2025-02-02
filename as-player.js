// VARIABLES, CONSTANTS
const   video = document.getElementById('video'),
        headingOne = document.querySelector('.heading-one'),
        headingTwo = document.querySelector('.heading-two'),
        title = document.querySelector('h2'),
        muteButton = document.querySelector('.mute-button'),
        playButton = document.querySelector('.play-button'),
        volumeOn = Array.from(document.querySelectorAll('.volume')),
        volumeOff = document.querySelector('.volume-mute'),
        forward = document.querySelector('.forward'),
        backward = document.querySelector('.backward'),
        youtubeLink = document.querySelector('.ytb-link a'),
        posters = Array.from(document.querySelectorAll('.poster')),
        sliderButtons = Array.from(document.querySelectorAll('.circle')),
        playIcon = document.querySelector('.play-icon'),
        pauseIcon = document.querySelector('.pause-icon'),
        categories = ['music-composition.json', 'sound-design.json','audio-engineering.json'];

let     firstMovie, secondMovie, thirdMovie;
let     activeIndex = 0;
let     scrollBarIndex = 0;
let     sliderInterval;
let     category = categories[0];

// FETCH MOVIES
async function fetchMovies() {
    try {
        const response = await fetch(category);
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
// changeCategory();
soundOn();

// VISUAL INITIALIZE
function visualInitialize() {
    paused();
    const   movies = [firstMovie, secondMovie, thirdMovie];
    posters.forEach((poster, index) => {
        poster.style.background = `url(${movies[index].poster}) 50% 50% / cover no-repeat`;
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

        youtubeLink.setAttribute('href', movies[activeIndex].youtube);
        
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
playButton.addEventListener('click', () => {
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
    youtubeLink.addEventListener('click', event => {
            if (!video.paused && !video.ended) {
                video.pause();
                paused();
            }
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
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'inline';
}

function paused() {
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
}

function muted() {
    volumeOn.forEach((volume) => {
        volume.style.display = 'none';
    });
    volumeOff.style.display = 'inline';
}

function soundOn() {
    volumeOn.forEach((volume) => {
        volume.style.display = 'inline';
    });
    volumeOff.style.display = 'none';
}

// CHANGE CATEGORY
function changeCategory() {
    scrollBars.forEach((scrollBar, index) => {
        scrollBar.addEventListener('click', () => {
            if (index !== scrollBarIndex) {
                playButton.disabled = true;
                backward.disabled = true;
                forward.disabled = true;
                sliderButtons.forEach((sliderButton) => {
                    sliderButton.disabled = true;
                });
                video.pause();
                stopSlider();
                category = categories[index];
                scrollBarIndex = index;
                activeIndex = 0;
                posters.forEach((poster) => {
                    poster.classList.remove('fade-in');
                });
                setTimeout(() => {
                    fetchMovies();
                    if (index === 0) {
                        headingOne.innerText = "Music";
                        headingTwo.innerText = "Composition";
                    }
                    else if (index === 1) {
                        headingOne.innerText = "Sound";
                        headingTwo.innerText = "Design";
                    }
                    else if (index === 2) {
                        headingOne.innerText = "Audio";
                        headingTwo.innerText = "Engineering";
                    }
                    playButton.disabled = false;
                    backward.disabled = false;
                    forward.disabled = false;
                    sliderButtons.forEach((sliderButton) => {
                        sliderButton.disabled = false;
                    });
                }, 1000);
            }
        });
    });
}





document.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.querySelector('progress'),
          stickyElement = document.querySelector('.sticky-element'),
          previousSection = stickyElement.parentElement.previousElementSibling;

    let progressStartValue = previousSection.offsetTop + previousSection.offsetHeight,
        progressMaxValue = window.innerHeight * 5,
        triggered = false;

    progressBar.max = progressMaxValue;

    // Funkcia na aktualizáciu hodnôt pri resize viewportu
    const updateOnResize = () => {
        progressStartValue = previousSection.offsetTop + previousSection.offsetHeight;
        progressMaxValue = window.innerHeight * 5;
        progressBar.max = progressMaxValue;

        // Ihneď aktualizuje progress bar po resize
        updateProgressBar();

        console.log("Viewport resized:");
        console.log("progressStartValue:", progressStartValue);
        console.log("progressMaxValue:", progressMaxValue);
    };

    // Funkcia na aktualizáciu hodnoty progress baru pri scrollovaní
    const updateProgressBar = () => {
        let scrollProgress = Math.max(0, window.scrollY - progressStartValue);
        progressBar.value = Math.min(scrollProgress, progressMaxValue);

        console.log('scrollProgress:', scrollProgress);
        console.log('progressBar:', progressBar.value);
    };

    // Správne spracovanie sticky efektu
    const checkSticky = () => {
        let rect = stickyElement.getBoundingClientRect();

        if (rect.top === 0 && !triggered) {
            triggered = true;
        } else if (rect.top > 50 || rect.bottom < 0) {
            triggered = false;
        }
    };

    // Pridanie event listenerov
    window.addEventListener("scroll", () => {
        checkSticky();
        updateProgressBar();
    });

    window.addEventListener("resize", updateOnResize); // Volanie update pri zmene veľkosti

    // Inicializácia po načítaní
    checkSticky();
    updateProgressBar();
});