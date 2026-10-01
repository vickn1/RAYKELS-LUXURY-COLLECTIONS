import {
  createHomepageMediaController
} from './homepage-media-controller.js';

import {
  renderHomepageMedia
} from './homepage-media-renderer.js';

export function createHomepageCarousel({
  container,
  products = [],
  mode = 'catalogue',
  selections = [],
  rotationSeconds = 5,
  previousButton = null,
  nextButton = null
} = {}) {
  if (!container) {
    throw new Error(
      'Homepage carousel requires a container.'
    );
  }

  const controller =
    createHomepageMediaController({
      products,
      mode,
      selections
    });

  let timer = null;
  let destroyed = false;

  function render() {
    if (destroyed) return null;

    return renderHomepageMedia(
      container,
      controller.current()
    );
  }

  function next() {
    if (destroyed) return null;

    const media = controller.next();

    render();

    return media;
  }

  function previous() {
    if (destroyed) return null;

    const media = controller.previous();

    render();

    return media;
  }

  function start() {
    if (destroyed || timer || rotationSeconds <= 0) {
      return;
    }

    timer = setInterval(
      next,
      rotationSeconds * 1000
    );
  }

  function stop() {
    if (!timer) return;

    clearInterval(timer);
    timer = null;
  }

  function handlePrevious() {
    previous();
  }

  function handleNext() {
    next();
  }

  if (previousButton) {
    previousButton.addEventListener(
      'click',
      handlePrevious
    );
  }

  if (nextButton) {
    nextButton.addEventListener(
      'click',
      handleNext
    );
  }

  let touchStartX = null;

  function handleTouchStart(event) {
    const touch = event.touches?.[0];

    if (!touch) return;

    touchStartX = touch.clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartX === null) return;

    const touch = event.changedTouches?.[0];

    if (!touch) {
      touchStartX = null;
      return;
    }

    const distance =
      touch.clientX - touchStartX;

    touchStartX = null;

    if (Math.abs(distance) < 40) {
      return;
    }

    if (distance < 0) {
      next();
    } else {
      previous();
    }
  }

  container.addEventListener(
    'touchstart',
    handleTouchStart,
    { passive: true }
  );

  container.addEventListener(
    'touchend',
    handleTouchEnd,
    { passive: true }
  );

  render();
  start();

  function destroy() {
    if (destroyed) return;

    destroyed = true;

    stop();

    if (previousButton) {
      previousButton.removeEventListener(
        'click',
        handlePrevious
      );
    }

    if (nextButton) {
      nextButton.removeEventListener(
        'click',
        handleNext
      );
    }

    container.removeEventListener(
      'touchstart',
      handleTouchStart
    );

    container.removeEventListener(
      'touchend',
      handleTouchEnd
    );
  }

  return {
    current: () => controller.current(),
    next,
    previous,
    start,
    stop,
    destroy,
    getIndex: () => controller.getIndex(),
    getAll: () => controller.getAll()
  };
}
