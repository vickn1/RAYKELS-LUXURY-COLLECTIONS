async function loadSiteConfig() {
  try {
    const response = await fetch('/api/site');

    if (!response.ok) {
      throw new Error(`Site config request failed: ${response.status}`);
    }

    const site = await response.json();

    window.RaykelsSite = site;

    console.log(
      `Raykels site config loaded: ${site?.brand?.name || 'Unknown brand'}`
    );

    return site;
  } catch (error) {
    console.error('Raykels site config could not be loaded:', error);

    window.RaykelsSite = null;

    return null;
  }
}

window.RaykelsSiteAPI = {
  loadSiteConfig
};

window.RaykelsSiteReady = loadSiteConfig();
