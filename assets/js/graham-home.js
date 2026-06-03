(function () {
  var carousels = document.querySelectorAll('.js-graham-carousel');

  for (var i = 0; i < carousels.length; i++) {
    setupCarousel(carousels[i]);
  }

  var lightbox = document.querySelector('.js-graham-lightbox');
  var lightboxTriggers = document.querySelectorAll('.graham-portfolio__vr-images img, .graham-portfolio__gallery img');

  if (lightbox && lightboxTriggers.length) {
    setupLightbox(lightbox, lightboxTriggers);
  }

  var videoLightbox = document.querySelector('.js-graham-video-lightbox');
  var videoTriggers = document.querySelectorAll('.js-graham-video-trigger');

  if (videoLightbox && videoTriggers.length) {
    setupVideoLightbox(videoLightbox, videoTriggers);
  }

  setupTweetTheme();

  function setupTweetTheme() {
    var tweetWrappers = document.querySelectorAll('.js-graham-tweet');
    var tweetRenderToken = 0;

    if (!tweetWrappers.length) {
      return;
    }

    function getTweetTheme() {
      return document.documentElement.classList.contains('graham-theme-dark') ? 'dark' : 'light';
    }

    function releaseTweetHeights(outputs, token) {
      if (token !== tweetRenderToken) {
        return;
      }

      for (var outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
        outputs[outputIndex].style.height = '';
        outputs[outputIndex].style.minHeight = '';
        outputs[outputIndex].classList.remove('is-loading');
        outputs[outputIndex].classList.remove('is-loading-dark');
      }
    }

    function waitForRenderedTweets(outputs, attempts, token) {
      if (token !== tweetRenderToken) {
        return;
      }

      var rendered = true;

      for (var outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
        var card = outputs[outputIndex].querySelector('iframe, .twitter-tweet-rendered');

        if (!card || card.offsetHeight < 80) {
          rendered = false;
          break;
        }
      }

      if (rendered || attempts <= 0) {
        window.setTimeout(function () {
          releaseTweetHeights(outputs, token);
        }, 220);
        return;
      }

      window.setTimeout(function () {
        waitForRenderedTweets(outputs, attempts - 1, token);
      }, 120);
    }

    function loadTwitterWidgets(outputs, attempts, token) {
      if (token !== tweetRenderToken) {
        return;
      }

      if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function') {
        for (var outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
          window.twttr.widgets.load(outputs[outputIndex]);
        }

        waitForRenderedTweets(outputs, 45, token);
        return;
      }

      if (attempts > 0) {
        window.setTimeout(function () {
          loadTwitterWidgets(outputs, attempts - 1, token);
        }, 120);
      } else {
        releaseTweetHeights(outputs, token);
      }
    }

    function renderTweets(theme) {
      tweetRenderToken++;

      var renderToken = tweetRenderToken;
      var outputs = [];

      for (var wrapperIndex = 0; wrapperIndex < tweetWrappers.length; wrapperIndex++) {
        var wrapper = tweetWrappers[wrapperIndex];
        var template = wrapper.querySelector('template');
        var output = wrapper.querySelector('.js-graham-tweet-output');

        if (!template || !output) {
          continue;
        }

        var outputHeight = Math.ceil(output.getBoundingClientRect().height);

        if (outputHeight > 0) {
          output.style.height = outputHeight + 'px';
          output.style.minHeight = outputHeight + 'px';
          output.classList.add('is-loading');
          output.classList.toggle('is-loading-dark', theme === 'dark');
        }

        output.innerHTML = template.innerHTML.trim();
        outputs.push(output);

        var tweet = output.querySelector('.twitter-tweet');

        if (tweet) {
          tweet.setAttribute('data-theme', theme);
        }
      }

      loadTwitterWidgets(outputs, 25, renderToken);
    }

    renderTweets(getTweetTheme());

    window.addEventListener('graham-theme-change', function (event) {
      renderTweets(event.detail && event.detail.dark ? 'dark' : 'light');
    });
  }

  function setupCarousel(carousel) {
    var slides = carousel.querySelectorAll('.graham-carousel__slide');
    var dots = carousel.querySelectorAll('.graham-carousel__dots button');
    var previousButton = carousel.querySelector('.graham-carousel__arrow--previous');
    var nextButton = carousel.querySelector('.graham-carousel__arrow--next');
    var visibleDots = 7;
    var index = 0;

    if (!slides.length || !dots.length) {
      return;
    }

    function showSlide(nextIndex) {
      if (nextIndex < 0) {
        nextIndex = slides.length - 1;
      } else if (nextIndex >= slides.length) {
        nextIndex = 0;
      }

      if (nextIndex === index) {
        updateDots();
        return;
      }

      slides[index].classList.remove('is-active');
      slides[index].setAttribute('aria-hidden', 'true');
      dots[index].classList.remove('is-active');
      dots[index].removeAttribute('aria-current');
      index = nextIndex;
      slides[index].classList.add('is-active');
      slides[index].removeAttribute('aria-hidden');
      dots[index].classList.add('is-active');
      dots[index].setAttribute('aria-current', 'true');
      updateDots();
    }

    function updateDots() {
      var count = dots.length;
      var shown = Math.min(visibleDots, count);
      var start = Math.max(0, Math.min(index - Math.floor(shown / 2), count - shown));
      var end = start + shown - 1;

      for (var dotIndex = 0; dotIndex < count; dotIndex++) {
        dots[dotIndex].classList.remove('is-dot-hidden', 'is-dot-small', 'is-dot-tiny');
        if (dotIndex < start || dotIndex > end) {
          dots[dotIndex].classList.add('is-dot-hidden');
        }
      }

      if (start > 0) {
        dots[start].classList.add('is-dot-tiny');
        if (start + 1 <= end) {
          dots[start + 1].classList.add('is-dot-small');
        }
      }

      if (end < count - 1) {
        dots[end].classList.add('is-dot-tiny');
        if (end - 1 >= start) {
          dots[end - 1].classList.add('is-dot-small');
        }
      }
    }

    for (var j = 0; j < dots.length; j++) {
      dots[j].addEventListener('click', function () {
        showSlide(parseInt(this.getAttribute('data-slide'), 10));
      });
    }

    if (previousButton) {
      previousButton.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    for (var k = 0; k < slides.length; k++) {
      if (k === 0) {
        slides[k].classList.add('is-active');
        slides[k].removeAttribute('aria-hidden');
      } else {
        slides[k].classList.remove('is-active');
        slides[k].setAttribute('aria-hidden', 'true');
      }
    }

    dots[0].classList.add('is-active');
    dots[0].setAttribute('aria-current', 'true');
    updateDots();
  }

  function setupLightbox(lightboxElement, triggers) {
    var image = lightboxElement.querySelector('.js-graham-lightbox-image');
    var closeButton = lightboxElement.querySelector('.js-graham-lightbox-close');
    var previousButton = lightboxElement.querySelector('.js-graham-lightbox-previous');
    var nextButton = lightboxElement.querySelector('.js-graham-lightbox-next');
    var index = 0;
    var returnFocus = null;

    function showImage(nextIndex) {
      if (nextIndex < 0) {
        nextIndex = triggers.length - 1;
      } else if (nextIndex >= triggers.length) {
        nextIndex = 0;
      }

      index = nextIndex;
      image.src = triggers[index].currentSrc || triggers[index].src;
      image.alt = triggers[index].alt || 'Portfolio gallery image ' + (index + 1);
    }

    function openLightbox(nextIndex, trigger) {
      returnFocus = trigger;
      showImage(nextIndex);
      lightboxElement.classList.add('is-open');
      lightboxElement.setAttribute('aria-hidden', 'false');
      document.body.classList.add('graham-lightbox-open');
      closeButton.focus();
    }

    function closeLightbox() {
      lightboxElement.classList.remove('is-open');
      lightboxElement.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('graham-lightbox-open');

      if (returnFocus) {
        returnFocus.focus();
      }
    }

    for (var triggerIndex = 0; triggerIndex < triggers.length; triggerIndex++) {
      triggers[triggerIndex].classList.add('graham-portfolio__lightbox-trigger');
      triggers[triggerIndex].setAttribute('tabindex', '0');
      triggers[triggerIndex].setAttribute('role', 'button');
      triggers[triggerIndex].setAttribute('aria-label', 'Open image ' + (triggerIndex + 1) + ' of ' + triggers.length);
      triggers[triggerIndex].setAttribute('data-lightbox-index', triggerIndex);
      triggers[triggerIndex].addEventListener('click', function () {
        openLightbox(parseInt(this.getAttribute('data-lightbox-index'), 10), this);
      });
      triggers[triggerIndex].addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(parseInt(this.getAttribute('data-lightbox-index'), 10), this);
        }
      });
    }

    closeButton.addEventListener('click', closeLightbox);
    previousButton.addEventListener('click', function () {
      showImage(index - 1);
    });
    nextButton.addEventListener('click', function () {
      showImage(index + 1);
    });

    document.addEventListener('keydown', function (event) {
      if (!lightboxElement.classList.contains('is-open')) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        showImage(index - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        showImage(index + 1);
      }
    });
  }

  function setupVideoLightbox(lightboxElement, triggers) {
    var frame = lightboxElement.querySelector('.js-graham-video-lightbox-frame');
    var frameContainer = lightboxElement.querySelector('.graham-video-lightbox__frame');
    var closeButton = lightboxElement.querySelector('.js-graham-video-lightbox-close');
    var previousButton = lightboxElement.querySelector('.js-graham-video-lightbox-previous');
    var nextButton = lightboxElement.querySelector('.js-graham-video-lightbox-next');
    var index = 0;
    var returnFocus = null;

    function showVideo(nextIndex) {
      if (nextIndex < 0) {
        nextIndex = triggers.length - 1;
      } else if (nextIndex >= triggers.length) {
        nextIndex = 0;
      }

      index = nextIndex;
      var provider = triggers[index].getAttribute('data-video-provider') || 'youtube';
      var videoId = encodeURIComponent(triggers[index].getAttribute('data-video-id'));
      frame.title = triggers[index].getAttribute('data-video-title') || 'Portfolio project video';
      frameContainer.classList.toggle('is-portrait', provider === 'tiktok');

      if (provider === 'tiktok') {
        frame.src = 'https://www.tiktok.com/player/v1/' + videoId + '?autoplay=1';
      } else {
        frame.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&playsinline=1';
      }
    }

    function openLightbox(nextIndex, trigger) {
      returnFocus = trigger;
      showVideo(nextIndex);
      lightboxElement.classList.add('is-open');
      lightboxElement.setAttribute('aria-hidden', 'false');
      document.body.classList.add('graham-lightbox-open');
      closeButton.focus();
    }

    function closeLightbox() {
      lightboxElement.classList.remove('is-open');
      lightboxElement.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('graham-lightbox-open');
      frame.src = '';
      frameContainer.classList.remove('is-portrait');

      if (returnFocus) {
        returnFocus.focus();
      }
    }

    for (var triggerIndex = 0; triggerIndex < triggers.length; triggerIndex++) {
      triggers[triggerIndex].setAttribute('data-video-index', triggerIndex);
      triggers[triggerIndex].addEventListener('click', function () {
        openLightbox(parseInt(this.getAttribute('data-video-index'), 10), this);
      });
    }

    closeButton.addEventListener('click', closeLightbox);
    previousButton.addEventListener('click', function () {
      showVideo(index - 1);
    });
    nextButton.addEventListener('click', function () {
      showVideo(index + 1);
    });

    document.addEventListener('keydown', function (event) {
      if (!lightboxElement.classList.contains('is-open')) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        showVideo(index - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        showVideo(index + 1);
      }
    });
  }
}());
