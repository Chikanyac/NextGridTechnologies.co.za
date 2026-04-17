// Vercel Speed Insights - Vanilla JS Implementation
// This script initializes Vercel Speed Insights for the static website

(function() {
  'use strict';
  
  // Initialize the Speed Insights queue
  function initQueue() {
    if (window.si) return;
    window.si = function(...params) {
      (window.siq = window.siq || []).push(params);
    };
  }
  
  // Check if we're in a browser environment
  function isBrowser() {
    return typeof window !== 'undefined';
  }
  
  // Detect the environment
  function detectEnvironment() {
    try {
      const env = process.env.NODE_ENV;
      if (env === 'development' || env === 'test') {
        return 'development';
      }
    } catch (e) {
      // Not in a Node environment
    }
    return 'production';
  }
  
  // Check if we're in development mode
  function isDevelopment() {
    return detectEnvironment() === 'development';
  }
  
  // Get the script source URL
  function getScriptSrc(props) {
    if (props.scriptSrc) {
      return props.scriptSrc;
    }
    if (isDevelopment()) {
      return 'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js';
    }
    if (props.dsn) {
      return 'https://va.vercel-scripts.com/v1/speed-insights/script.js';
    }
    if (props.basePath) {
      return props.basePath + '/speed-insights/script.js';
    }
    // Default path when deployed on Vercel
    return '/_vercel/speed-insights/script.js';
  }
  
  // Inject the Speed Insights script
  function injectSpeedInsights(props) {
    props = props || {};
    
    if (!isBrowser() || props.route === null) {
      return null;
    }
    
    initQueue();
    
    const src = getScriptSrc(props);
    
    // Check if script is already loaded
    if (document.head.querySelector('script[src*="' + src + '"]')) {
      return null;
    }
    
    // Set up beforeSend middleware if provided
    if (props.beforeSend && window.si) {
      window.si('beforeSend', props.beforeSend);
    }
    
    // Create and configure the script element
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset.sdkn = '@vercel/speed-insights';
    script.dataset.sdkv = '1.3.1';
    
    if (props.sampleRate) {
      script.dataset.sampleRate = props.sampleRate.toString();
    }
    
    if (props.route) {
      script.dataset.route = props.route;
    }
    
    if (props.endpoint) {
      script.dataset.endpoint = props.endpoint;
    } else if (props.basePath) {
      script.dataset.endpoint = props.basePath + '/speed-insights/vitals';
    }
    
    if (props.dsn) {
      script.dataset.dsn = props.dsn;
    }
    
    if (isDevelopment() && props.debug === false) {
      script.dataset.debug = 'false';
    }
    
    // Error handler
    script.onerror = function() {
      console.log(
        '[Vercel Speed Insights] Failed to load script from ' + src + 
        '. Please check if any content blockers are enabled and try again.'
      );
    };
    
    // Append script to head
    document.head.appendChild(script);
    
    return {
      setRoute: function(route) {
        script.dataset.route = route || undefined;
      }
    };
  }
  
  // Initialize Speed Insights when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectSpeedInsights();
    });
  } else {
    // DOM is already ready
    injectSpeedInsights();
  }
})();
