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
        categoryWrappers = Array.from(document.querySelectorAll('.poster-category'));

let     firstMovie, secondMovie, thirdMovie,
        activeIndex = 0,
        previousCategoryIndex = -1,
        sliderInterval,
        resizeTimer,
        videoData = [];

// FETCH MOVIES
let videoDataPromise = fetchMovies();

async function fetchMovies() {
    try {
        const response = await fetch('portfolio.json');
        const data = await response.json();
        videoData = data;
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

// PROGRESS BAR UPDATE
document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.querySelector('progress'),
          previousSection = video.parentElement.parentElement.parentElement.previousElementSibling,
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
visualInitialize();
manualChange();
paused();
soundOn();

// CHANGE CATEGORY
async function changeCategory(newCategoryIndex) {
    if (newCategoryIndex === previousCategoryIndex) return;

    await videoDataPromise;

    const firstWrapper = categoryWrappers[0];
    const secondWrapper = categoryWrappers[1];
    const thirdWrapper = categoryWrappers[2];

    function moveWrapper(wrapper, offsetPx) {
        if (!wrapper) return; // Ochrana pred chybou, ak wrapper neexistuje
    
        const currentTransform = getComputedStyle(wrapper).transform;
    
        // Získame aktuálnu hodnotu translateY
        let currentY = 0;
        if (currentTransform !== 'none') {
            const matrix = new DOMMatrix(currentTransform);
            currentY = matrix.m42; // Y-ová súradnica transformácie
        }
    
        // Priamy výpočet novej hodnoty (sčítavame alebo odčítavame offsetPx)
        const newY = currentY + offsetPx;
        wrapper.style.transform = `translateY(${newY}px)`;
    
        return newY; // Vracia novú hodnotu translateY
    }

    if (newCategoryIndex === 0) {
        if (newCategoryIndex > previousCategoryIndex) {
            // Pohyb dopredu (0 → 1)

        } else {
            // Pohyb dozadu (2 → 1)
            moveWrapper(secondWrapper, video.clientHeight);
            moveWrapper(firstWrapper, video.clientHeight);
        }
    } 
    else if (newCategoryIndex === 1) {
        if (newCategoryIndex > previousCategoryIndex) {
            // Pohyb dopredu (0 → 1)
            moveWrapper(firstWrapper, -video.clientHeight);
            moveWrapper(secondWrapper, -video.clientHeight);
        } else {
            // Pohyb dozadu (2 → 1)
            moveWrapper(thirdWrapper, video.clientHeight);
            moveWrapper(secondWrapper, video.clientHeight);
        }
    } 
    else if (newCategoryIndex === 2) {
        if (newCategoryIndex > previousCategoryIndex) {
            // Pohyb dopredu (1 → 2)
            moveWrapper(secondWrapper, -video.clientHeight);
            moveWrapper(thirdWrapper, -video.clientHeight);
        } else {
            // Pohyb dozadu (2 → 1)

        }
    }

    previousCategoryIndex = newCategoryIndex;
    video.pause();
    activeIndex = 0; 

    firstMovie = videoData[previousCategoryIndex].videos[0];
    secondMovie = videoData[previousCategoryIndex].videos[1];
    thirdMovie = videoData[previousCategoryIndex].videos[2];

    headingOne.innerText = videoData[previousCategoryIndex].category.split(" ")[0];
    headingTwo.innerText = videoData[previousCategoryIndex].category.split(" ")[1] || "";

    stopSlider();
    changeContent(previousCategoryIndex);
    startSlider();
}

// VISUAL INITIALIZE
async function visualInitialize() {
    await videoDataPromise;
    const allVideos = videoData.flatMap(category => category.videos);
    posters.forEach((poster, index) => {
            poster.style.background = `url(${allVideos[index].poster}) 50% 50% / cover no-repeat`;
    });
}

// CHANGE CONTENT
function changeContent(previousCategoryIndex) {
    const movies = [firstMovie, secondMovie, thirdMovie];

    posters.forEach((poster, index) => {
        const categoryStartIndex = previousCategoryIndex * 3;
        const localIndex = index - categoryStartIndex;
        const isInCurrentCategory = index >= categoryStartIndex && index < categoryStartIndex + 3;
        const isActive = index >= categoryStartIndex && index < categoryStartIndex + 3 && localIndex === activeIndex;

        poster.style.opacity = isActive ? 1 : (isInCurrentCategory ? 0 : 1);
        poster.style.zIndex = isActive ? 2 : (isInCurrentCategory ? 1 : poster.style.zIndex);
    });

    video.style.visibility = 'hidden';
    paused();
    video.pause();
    video.src = movies[activeIndex].source;
    video.load();
    title.textContent = movies[activeIndex].title;

    sliderButtons.forEach(slide => slide.classList.remove('full'));
    sliderButtons[activeIndex].classList.add('full');

    youtubeLink.setAttribute('href', movies[activeIndex].youtube);
}

// MANUAL CHANGE
function manualChange() {
    sliderButtons.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (index !== activeIndex) {             
                stopSlider();
                activeIndex = index;
                changeContent(previousCategoryIndex);
                startSlider();
            }
        });
    });
    forward.addEventListener('click', () => {     
        stopSlider();
        activeIndex = activeIndex < 2 ? activeIndex + 1 : 0;
        changeContent(previousCategoryIndex);
        startSlider();
    });
    backward.addEventListener('click', () => {      
        stopSlider();
        activeIndex = activeIndex === 0 ? 2 : activeIndex - 1;
        changeContent(previousCategoryIndex);
        startSlider();
    });
}

// START SLIDER
function startSlider() {
    sliderInterval = setInterval(() => {
        activeIndex = (activeIndex + 1) % 3;
        changeContent(previousCategoryIndex);
    }, 4000);
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
            video.style.visibility = 'visible';
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