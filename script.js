const siteMetadata = {
  brand: "RAYKELS LUXURY COLLECTIONS",
  builtBy: "WIZARD",
  developer: "WIZARD",
  year: 2026
};

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
    });
  });
}

async function loadRaykelsSiteConfig() {
  if (!window.RaykelsSiteAPI) {
    console.warn('Raykels site config API is not available.');
    return null;
  }

  return await window.RaykelsSiteAPI.loadSiteConfig();
}

async function loadRaykelsData() {
  try {
    const brandResponse = await fetch('/assets/brand/brand.json');
    const assetsResponse = await fetch('/assets/brand/assets.json');

    const brand = await brandResponse.json();
    const assets = await assetsResponse.json();

    document.title = brand.name;

    document.querySelectorAll('[data-brand-name]').forEach(el => {
      el.textContent = brand.name;
    });

    document.querySelectorAll('[data-brand-short]').forEach(el => {
      el.textContent = brand.shortName;
    });

    document.querySelectorAll('[data-tagline]').forEach(el => {
      el.textContent = brand.tagline;
    });

    document.querySelectorAll('[data-social]').forEach(el => {
      const platform = el.dataset.social;
      const url = brand[platform];

      if (url) {
        el.href = url;
      } else {
        el.style.display = 'none';
      }
    });

    window.Raykels = {
      brand,
      assets
    };

    console.log('Raykels data loaded:', window.Raykels);
  } catch (error) {
    console.error('Raykels data could not be loaded:', error);
  }
}

loadRaykelsSiteConfig();
loadRaykelsData();
