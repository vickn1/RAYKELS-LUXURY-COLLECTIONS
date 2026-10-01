async function loadRaykelsTracking() {
  try {
    const response = await fetch('/assets/tracking/config.json');

    if (!response.ok) return;

    const config = await response.json();

    if (!config.enabled) {
      console.log('Raykels tracking is currently disabled.');
      return;
    }

    if (config.meta?.pixelId) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}
        (window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', '${config.meta.pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }

    if (config.google?.analyticsId) {
      const script = document.createElement('script');
      script.async = true;
      script.src =
        `https://www.googletagmanager.com/gtag/js?id=${config.google.analyticsId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];

      function gtag() {
        dataLayer.push(arguments);
      }

      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', config.google.analyticsId);
    }

    if (config.google?.adsId) {
      window.gtag = window.gtag || function() {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(arguments);
      };

      gtag('config', config.google.adsId);
    }

    console.log('Raykels advertising tracking loaded.');

  } catch (error) {
    console.error('Raykels tracking failed:', error);
  }
}

(function loadRaykelsFirstPartyAnalytics() {
  try {
    const script = document.createElement('script');

    script.src = '/assets/tracking/raykels-analytics.js';
    script.async = false;

    script.onload = function () {
      if (
        window.RaykelsAnalytics &&
        typeof window.RaykelsAnalytics.pageView === 'function'
      ) {
        window.RaykelsAnalytics.pageView();
      }
    };

    document.head.appendChild(script);
  } catch (error) {
    console.error(
      'Raykels first-party analytics failed:',
      error
    );
  }
})();

loadRaykelsTracking();
