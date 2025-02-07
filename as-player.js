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
let     currentCategoryIndex = 0;
let     sliderInterval;

// FETCH MOVIES
async function fetchMovies() {
    try {
        const response = await fetch(categories[currentCategoryIndex]);
        const data = await response.json();

        firstMovie = data[0];
        secondMovie = data[1];
        thirdMovie = data[2];

        stopSlider();
        visualInitialize();
        changeContent();
        startSlider();
    }
    catch (error) {
        console.error('Error loading JSON:', error);
    }
}

changeCategory();
manualChange();
paused();
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
function changeCategory(newCategoryIndex) {
    if (newCategoryIndex === currentCategoryIndex) return;

    currentCategoryIndex = newCategoryIndex;

    video.pause(); 
    playButton.disabled = true;
    backward.disabled = true;
    forward.disabled = true;
    sliderButtons.forEach(sliderButton => sliderButton.disabled = true);
    posters.forEach(poster => poster.classList.remove('fade-in'));

    if (newCategoryIndex === 0) {
        headingOne.innerText = "Music";
        headingTwo.innerText = "Composition";
    } else if (newCategoryIndex === 1) {
        headingOne.innerText = "Sound";
        headingTwo.innerText = "Design";
    } else if (newCategoryIndex === 2) {
        headingOne.innerText = "Audio";
        headingTwo.innerText = "Engineering";
    }

    setTimeout(() => {
        activeIndex = 0;
        fetchMovies();
        playButton.disabled = false;
        backward.disabled = false;
        forward.disabled = false;
        sliderButtons.forEach(sliderButton => sliderButton.disabled = false);
    }, 1000);
}


document.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.querySelector('progress'),
          stickyElement = document.querySelector('.sticky-element'),
          previousSection = stickyElement.parentElement.previousElementSibling,
          scrollbars = document.querySelectorAll(".scrollbar");

    let progressStartValue = previousSection.offsetTop + previousSection.offsetHeight,
        progressMaxValue = window.innerHeight * 5;

    progressBar.max = progressMaxValue;

    const updateOnResize = () => {
        progressStartValue = previousSection.offsetTop + previousSection.offsetHeight;
        progressMaxValue = window.innerHeight * 5;
        progressBar.max = progressMaxValue;

        updateProgressBar();
        updateScrollbars();
    };

    const updateProgressBar = () => {
        let scrollProgress = Math.max(0, window.scrollY - progressStartValue),
            progressPercent = Math.floor((scrollProgress / progressMaxValue) * 100);

        progressBar.value = Math.min(scrollProgress, progressMaxValue);

        let newCategoryIndex = 0;

        if (progressPercent > 33 && progressPercent <= 66) {
            newCategoryIndex = 1;
        } else if (progressPercent > 66) {
            newCategoryIndex = 2;
        }

        updateScrollbars();
        changeCategory(newCategoryIndex);
    };

    const updateScrollbars = () => {
        let progressPercent = (progressBar.value / progressBar.max) * 100;

        scrollbars.forEach((scrollbar, index) => {
            let start = index * 33.3;  // 0%, 33.3%, 66.6%
            let end = (index + 1) * 33.3; // 33.3%, 66.6%, 100%

            if (progressPercent >= end) {
                scrollbar.style.backgroundSize = "100% 100%"; // Ak progress presiahol celý úsek
            } else if (progressPercent > start) {
                let fillAmount = ((progressPercent - start) / (end - start)) * 100;
                scrollbar.style.backgroundSize = `${fillAmount}% 100%`; // Dynamické vyplnenie
            } else {
                scrollbar.style.backgroundSize = "0% 100%"; // Ak progress ešte nedosiahol úsek
            }
        });
    };

    window.addEventListener("scroll", () => {
        updateProgressBar();
    });

    window.addEventListener("resize", updateOnResize);

    updateProgressBar();
});

const updateVH = () => {
    requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    });
};

// Funkcia na optimalizáciu resize eventu (debounce)
let resizeTimer;
const optimizedResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateVH();
    }, 100); // Počká 100ms po poslednej zmene veľkosti
};

window.addEventListener('resize', optimizedResize);
window.addEventListener('load', updateVH);