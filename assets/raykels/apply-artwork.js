(function () {
  'use strict';

  const artwork = window.RaykelsArtwork || {};

  const mappings = {
    hair: ['--raykels-hair-image', '.hair-card'],
    bags: ['--raykels-bags-image', '.bags-card'],
    shoes: ['--raykels-shoes-image', '.shoes-card'],
    children: ['--raykels-children-image', '.children-world-card'],
    wigCare: ['--raykels-wig-care-image', '.wig-care-world-card'],
    delivery: ['--raykels-delivery-image', '.delivery-world-card'],
    consultation: ['--raykels-consultation-image', '.consultation-world-card']
  };

  Object.entries(mappings).forEach(([key, [variable, selector]]) => {
    const value = artwork[key];

    document.querySelectorAll(selector).forEach(card => {
      if (value) {
        card.style.setProperty(variable, `url("${value}")`);
        card.classList.add('has-artwork');
      } else {
        card.style.removeProperty(variable);
        card.classList.remove('has-artwork');
      }
    });
  });
})();
