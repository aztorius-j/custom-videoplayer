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
        pauseIcon = document.querySelector('.pause-icon');

let     firstMovie, secondMovie, thirdMovie,
        activeIndex = 0,
        currentCategoryIndex,
        sliderInterval,
        resizeTimer,
        videoData = [];

// FETCH MOVIES
async function fetchMovies() {
    try {
        const response = await fetch('portfolio.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading JSON:', error);
        return [];
    }
}

fetchMovies().then(data => {
    videoData = data;
});

// PROGRESS BAR UPDATE
document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.querySelector('progress'),
          stickyElement = document.querySelector('.sticky-element'),
          previousSection = stickyElement.parentElement.previousElementSibling,
          scrollbars = document.querySelectorAll('.scrollbar');

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
            let start = index * 33.3;
            let end = (index + 1) * 33.3;

            if (progressPercent >= end) {
                scrollbar.style.backgroundSize = "100% 100%";
            } else if (progressPercent > start) {
                let fillAmount = ((progressPercent - start) / (end - start)) * 100;
                scrollbar.style.backgroundSize = `${fillAmount}% 100%`;
            } else {
                scrollbar.style.backgroundSize = "0% 100%";
            }
        });
    };

    window.addEventListener("scroll", () => {
        updateProgressBar();
    });

    window.addEventListener("resize", updateOnResize);

    updateProgressBar();
});

// OPTIMIZED RESIZE
const optimizedResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateVH();
    }, 100);
};

// UPDATE VH VARIABLE
const updateVH = () => {
    requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    });
};

// EVENT LISTENERS AND FUNCTION CALLS
window.addEventListener('resize', optimizedResize);
window.addEventListener('load', updateVH);
manualChange();
paused();
soundOn();

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

    setTimeout(() => {
        activeIndex = 0;

        firstMovie = videoData[currentCategoryIndex].videos[0];
        secondMovie = videoData[currentCategoryIndex].videos[1];
        thirdMovie = videoData[currentCategoryIndex].videos[2];

        headingOne.innerText = videoData[currentCategoryIndex].category.split(" ")[0];
        headingTwo.innerText = videoData[currentCategoryIndex].category.split(" ")[1] || "";

        stopSlider();
        visualInitialize(newCategoryIndex);
        changeContent();
        startSlider();

        playButton.disabled = false;
        backward.disabled = false;
        forward.disabled = false;
        sliderButtons.forEach(sliderButton => sliderButton.disabled = false);
    }, 1000);
}

// VISUAL INITIALIZE
function visualInitialize(newCategoryIndex) {
    paused();
    posters.forEach((poster, index) => {
        poster.style.background = `url(${videoData[newCategoryIndex].videos[index].poster}) 50% 50% / cover no-repeat`;
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