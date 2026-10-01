import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createHomepageMediaController
} from '../products/lib/homepage-media-controller.js';

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

test('starts at first media item', () => {
  const controller =
    createHomepageMediaController({
      products
    });

  assert.equal(controller.getIndex(), 0);
  assert.equal(controller.current().id, 'hair-image');
});

test('next advances and wraps around', () => {
  const controller =
    createHomepageMediaController({
      products
    });

  assert.equal(controller.next().id, 'bag-image');
  assert.equal(controller.next().id, 'shoe-image');
  assert.equal(controller.next().id, 'hair-image');
});

test('previous moves backward and wraps around', () => {
  const controller =
    createHomepageMediaController({
      products
    });

  assert.equal(controller.previous().id, 'shoe-image');
  assert.equal(controller.previous().id, 'bag-image');
});

test('goTo selects a valid position', () => {
  const controller =
    createHomepageMediaController({
      products
    });

  assert.equal(controller.goTo(2).id, 'shoe-image');
  assert.equal(controller.getIndex(), 2);
});

test('invalid goTo does not change position', () => {
  const controller =
    createHomepageMediaController({
      products
    });

  controller.goTo(1);

  assert.equal(controller.goTo(99).id, 'bag-image');
  assert.equal(controller.getIndex(), 1);
});

test('empty media is safe', () => {
  const controller =
    createHomepageMediaController({
      products: []
    });

  assert.equal(controller.current(), null);
  assert.equal(controller.next(), null);
  assert.equal(controller.previous(), null);
});

test('getAll returns a separate array', () => {
  const controller =
    createHomepageMediaController({
      products
    });

  const items = controller.getAll();

  assert.equal(items.length, 3);

  items.pop();

  assert.equal(
    controller.getAll().length,
    3
  );
});
