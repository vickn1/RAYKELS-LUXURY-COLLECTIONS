import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createHomepageCarousel
} from '../products/lib/homepage-carousel.js';

function createMockElement(tagName = 'div') {
  const listeners = new Map();

  return {
    tagName,
    innerHTML: '',
    children: [],
    dataset: {},
    attributes: {},

    appendChild(element) {
      this.children.push(element);
    },

    set innerHTML(value) {
      this._innerHTML = value;
      this.children = [];
    },

    get innerHTML() {
      return this._innerHTML || '';
    },

    setAttribute(name, value) {
      this.attributes[name] = value;
    },

    addEventListener(name, handler) {
      listeners.set(name, handler);
    },

    removeEventListener(name) {
      listeners.delete(name);
    },

    dispatch(name, event = {}) {
      const handler = listeners.get(name);

      if (handler) {
        handler(event);
      }
    },

    hasListener(name) {
      return listeners.has(name);
    }
  };
}

global.document = {
  createElement(tagName) {
    return createMockElement(tagName);
  }
};

const products = [
  {
    id: 'hair',
    name: 'Luxury Hair',
    published: true,
    media: [
      {
        id: 'hair-image',
        type: 'image',
        url: '/hair.jpg'
      }
    ]
  },
  {
    id: 'bag',
    name: 'Luxury Bag',
    published: true,
    media: [
      {
        id: 'bag-image',
        type: 'image',
        url: '/bag.jpg'
      }
    ]
  },
  {
    id: 'shoe',
    name: 'Luxury Shoe',
    published: true,
    media: [
      {
        id: 'shoe-image',
        type: 'image',
        url: '/shoe.jpg'
      }
    ]
  }
];

test('renders initial media', () => {
  const container = createMockElement();

  const carousel =
    createHomepageCarousel({
      container,
      products,
      rotationSeconds: 0
    });

  assert.equal(
    carousel.current().id,
    'hair-image'
  );

  assert.equal(container.children.length, 1);
  assert.equal(
    container.children[0].src,
    '/hair.jpg'
  );

  carousel.destroy();
});

test('next renders the next media', () => {
  const container = createMockElement();

  const carousel =
    createHomepageCarousel({
      container,
      products,
      rotationSeconds: 0
    });

  carousel.next();

  assert.equal(
    carousel.current().id,
    'bag-image'
  );

  assert.equal(
    container.children[0].src,
    '/bag.jpg'
  );

  carousel.destroy();
});

test('previous renders the previous media', () => {
  const container = createMockElement();

  const carousel =
    createHomepageCarousel({
      container,
      products,
      rotationSeconds: 0
    });

  carousel.next();
  carousel.previous();

  assert.equal(
    carousel.current().id,
    'hair-image'
  );

  assert.equal(
    container.children[0].src,
    '/hair.jpg'
  );

  carousel.destroy();
});

test('navigation buttons work', () => {
  const container = createMockElement();
  const previousButton = createMockElement('button');
  const nextButton = createMockElement('button');

  const carousel =
    createHomepageCarousel({
      container,
      products,
      previousButton,
      nextButton,
      rotationSeconds: 0
    });

  nextButton.dispatch('click');

  assert.equal(
    carousel.current().id,
    'bag-image'
  );

  previousButton.dispatch('click');

  assert.equal(
    carousel.current().id,
    'hair-image'
  );

  carousel.destroy();
});

test('touch swipe changes media', () => {
  const container = createMockElement();

  const carousel =
    createHomepageCarousel({
      container,
      products,
      rotationSeconds: 0
    });

  container.dispatch('touchstart', {
    touches: [{ clientX: 200 }]
  });

  container.dispatch('touchend', {
    changedTouches: [{ clientX: 100 }]
  });

  assert.equal(
    carousel.current().id,
    'bag-image'
  );

  carousel.destroy();
});

test('destroy removes interaction listeners', () => {
  const container = createMockElement();
  const previousButton = createMockElement('button');
  const nextButton = createMockElement('button');

  const carousel =
    createHomepageCarousel({
      container,
      products,
      previousButton,
      nextButton,
      rotationSeconds: 0
    });

  carousel.destroy();

  assert.equal(
    container.hasListener('touchstart'),
    false
  );

  assert.equal(
    container.hasListener('touchend'),
    false
  );
});

test('empty catalogue is safe', () => {
  const container = createMockElement();

  const carousel =
    createHomepageCarousel({
      container,
      products: [],
      rotationSeconds: 0
    });

  assert.equal(carousel.current(), null);
  assert.equal(carousel.next(), null);

  carousel.destroy();
});
