import { useEffect } from 'react';

const Analytics = () => {
  useEffect(() => {
    // 1. Google Analytics 4 (GA4)
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);
    }

    // 2. Microsoft Clarity
    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (clarityId) {
      const scriptClarity = document.createElement('script');
      scriptClarity.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `;
      document.head.appendChild(scriptClarity);
    }
  }, []);

  // Log a page_visits event on every SPA navigation. This is a single-page app,
  // so route changes happen via history.pushState and never trigger a fresh GA4
  // page_view on their own. We patch pushState/replaceState to emit an event,
  // and also listen for back/forward (popstate).
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!gaId) return;

    const sendPageVisit = () => {
      (window as any).gtag?.('event', 'page_visits', {
        page_path: window.location.pathname + window.location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    };

    const wrap = (orig: History['pushState']): History['pushState'] =>
      function (this: History, ...args) {
        const ret = orig.apply(this, args as Parameters<History['pushState']>);
        window.dispatchEvent(new Event('spa:locationchange'));
        return ret;
      };

    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = wrap(origPush);
    history.replaceState = wrap(origReplace);

    window.addEventListener('spa:locationchange', sendPageVisit);
    window.addEventListener('popstate', sendPageVisit);

    // Count the initial load too.
    sendPageVisit();

    return () => {
      window.removeEventListener('spa:locationchange', sendPageVisit);
      window.removeEventListener('popstate', sendPageVisit);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  return null;
};

export default Analytics;
