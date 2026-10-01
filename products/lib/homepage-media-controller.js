import {
  resolveHomepageMedia
} from './homepage-media.js';

export function createHomepageMediaController({
  products = [],
  mode = 'catalogue',
  selections = []
} = {}) {
  const media = resolveHomepageMedia({
    products,
    mode,
    selections
  });

  let index = 0;

  function current() {
    return media[index] || null;
  }

  function next() {
    if (!media.length) return null;

    index = (index + 1) % media.length;

    return current();
  }

  function previous() {
    if (!media.length) return null;

    index =
      (index - 1 + media.length) %
      media.length;

    return current();
  }

  function goTo(position) {
    if (!Number.isInteger(position)) {
      return current();
    }

    if (
      position < 0 ||
      position >= media.length
    ) {
      return current();
    }

    index = position;

    return current();
  }

  function getAll() {
    return [...media];
  }

  function getIndex() {
    return index;
  }

  return {
    current,
    next,
    previous,
    goTo,
    getAll,
    getIndex
  };
}
