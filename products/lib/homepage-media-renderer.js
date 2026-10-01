export function renderHomepageMedia(
  container,
  media
) {
  if (!container) {
    throw new Error(
      'Homepage media renderer requires a container.'
    );
  }

  container.innerHTML = '';

  if (
    !media ||
    typeof media.url !== 'string' ||
    !media.url
  ) {
    return null;
  }

  let element = null;

  if (media.type === 'image') {
    element = document.createElement('img');

    element.src = media.url;
    element.alt =
      media.alt ||
      media.productName ||
      'RAYKELS product';
  }

  if (media.type === 'video') {
    element = document.createElement('video');

    element.src = media.url;
    element.controls = true;
    element.playsInline = true;

    if (media.poster) {
      element.poster = media.poster;
    }

    element.setAttribute(
      'aria-label',
      media.title ||
      media.productName ||
      'RAYKELS product video'
    );
  }

  if (!element) {
    return null;
  }

  element.dataset.mediaId = media.id || '';

  if (media.productId) {
    element.dataset.productId = media.productId;
  }

  container.appendChild(element);

  return element;
}
