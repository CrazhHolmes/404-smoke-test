/**
 * 404 Smoke Test - JavaScript Snippet
 * Version: 2.0.0 (Supabase + Vercel Edition)
 * 
 * Usage:
 * <script src="https://your-vercel-url.vercel.app/404-smoke.js" 
 *         data-site="YOUR_SITE_SLUG" 
 *         async></script>
 */

(function() {
  'use strict';
  
  // Configuration - will be replaced during deployment
  const CONFIG = {
    API_URL: 'https://404-smoke-test.vercel.app/api',
    DEBUG: false
  };
  
  // Get current script tag
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  
  // Get site slug from data attribute
  const siteSlug = currentScript.getAttribute('data-site');
  
  if (!siteSlug) {
    console.error('[404 Smoke] Missing data-site attribute');
    return;
  }
  
  // Logger
  function log(...args) {
    if (CONFIG.DEBUG) {
      console.log('[404 Smoke]', ...args);
    }
  }
  
  // Track 404 error
  function track404(url, referrer) {
    log('Tracking 404:', url);
    
    const data = {
      site: siteSlug,
      url: url,
      referrer: referrer,
      timestamp: new Date().toISOString()
    };
    
    fetch(CONFIG.API_URL + '/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      log('Track response:', data);
      if (data.redirect_url) {
        redirectToGame(data.redirect_url);
      }
    })
    .catch(err => {
      console.error('[404 Smoke] Track error:', err);
    });
  }
  
  // Redirect to game page
  function redirectToGame(url) {
    log('Redirecting to:', url);
    setTimeout(() => {
      window.location.href = url;
    }, 100);
  }
  
  // Check if current page is a 404
  function checkFor404() {
    const title = document.title.toLowerCase();
    const is404Title = title.includes('404') || 
                       title.includes('not found') ||
                       title.includes('page not found');
    
    const bodyText = document.body.innerText.toLowerCase();
    const has404Text = bodyText.includes('404') && 
                      (bodyText.includes('not found') || 
                       bodyText.includes('page does not exist'));
    
    const url = window.location.href;
    const isErrorUrl = url.includes('/404') || url.includes('/error');
    
    return is404Title || has404Text || isErrorUrl;
  }
  
  // Intercept fetch requests
  function interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      return originalFetch.apply(this, args)
        .then(response => {
          if (response.status === 404) {
            track404(response.url, document.referrer);
          }
          return response;
        })
        .catch(error => {
          throw error;
        });
    };
  }
  
  // Intercept XMLHttpRequest
  function interceptXHR() {
    const OriginalXHR = window.XMLHttpRequest;
    
    function NewXHR() {
      const xhr = new OriginalXHR();
      const originalOpen = xhr.open;
      let requestUrl = '';
      
      xhr.open = function(method, url, ...args) {
        requestUrl = url;
        return originalOpen.call(this, method, url, ...args);
      };
      
      xhr.addEventListener('load', function() {
        if (this.status === 404) {
          track404(requestUrl, document.referrer);
        }
      });
      
      return xhr;
    }
    
    Object.keys(OriginalXHR).forEach(key => {
      NewXHR[key] = OriginalXHR[key];
    });
    
    window.XMLHttpRequest = NewXHR;
  }
  
  // Handle errors
  function handleErrors() {
    window.addEventListener('error', function(e) {
      if (e.target && e.target.tagName) {
        const tag = e.target.tagName.toLowerCase();
        if (['img', 'script', 'link', 'iframe'].includes(tag)) {
          const src = e.target.src || e.target.href;
          if (src) {
            log('Resource 404:', src);
            track404(src, document.referrer);
          }
        }
      }
    }, true);
    
    if (checkFor404()) {
      log('Detected 404 page');
      setTimeout(() => {
        track404(window.location.href, document.referrer);
      }, 500);
    }
  }
  
  // Initialize
  function init() {
    log('Initializing for site:', siteSlug);
    interceptFetch();
    interceptXHR();
    handleErrors();
    log('Ready');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose API
  window.Smoke404 = {
    track: track404,
    config: CONFIG,
    version: '2.0.0'
  };
  
})();
