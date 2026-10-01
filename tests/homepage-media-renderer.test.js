import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderHomepageMedia
} from '../products/lib/homepage-media-renderer.js';

function createMockElement(tagName) {
  return {
    tagName,
    src: '',
    alt: '',
    poster: '',
    controls: false,
    playsInline: false,
    dataset: {},
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };
}

function createMockContainer() {
  return {
    innerHTML: 'old-content',
    children: [],
    appendChild(element) {
      this.children.push(element);
    }
  };
}

global.document = {
  createElement(tagName) {
    return createMockElement(tagName);
  }
};

test('renders an image', () => {
  const container = createMockContainer();

  const element = renderHomepageMedia(
    container,
    {
      id: 'hair-image',
      type: 'image',
      url: '/hair.jpg',
      alt: 'Luxury hair',
      productId: 'hair'
    }
  );

  assert.equal(element.tagName, 'img');
  assert.equal(element.src, '/hair.jpg');
  assert.equal(element.alt, 'Luxury hair');
  assert.equal(element.dataset.mediaId, 'hair-image');
  assert.equal(element.dataset.productId, 'hair');
  assert.equal(container.children.length, 1);
});

test('renders a video with poster', () => {
  const container = createMockContainer();

  const element = renderHomepageMedia(
    container,
    {
      id: 'bag-video',
      type: 'video',
      url: '/bag.mp4',
      poster: '/bag.jpg',
      title: 'Luxury bag video',
      productId: 'bag'
    }
  );

  assert.equal(element.tagName, 'video');
  assert.equal(element.src, '/bag.mp4');
  assert.equal(element.poster, '/bag.jpg');
  assert.equal(element.controls, true);
  assert.equal(element.playsInline, true);
  assert.equal(
    element.attributes['aria-label'],
    'Luxury bag video'
  );
});

test('clears previous container content', () => {
  const container = createMockContainer();

  renderHomepageMedia(
    container,
    {
      id: 'shoe-image',
      type: 'image',
      url: '/shoe.jpg'
    }
  );

  assert.equal(container.innerHTML, '');
});

test('invalid media returns null', () => {
  const container = createMockContainer();

  const element = renderHomepageMedia(
    container,
    null
  );

  assert.equal(element, null);
  assert.equal(container.children.length, 0);
});

test('unsupported media type returns null', () => {
  const container = createMockContainer();

  const element = renderHomepageMedia(
    container,
    {
      id: 'unknown',
      type: 'audio',
      url: '/audio.mp3'
    }
  );

  assert.equal(element, null);
  assert.equal(container.children.length, 0);
});
