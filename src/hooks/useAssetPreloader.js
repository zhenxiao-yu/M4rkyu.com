import { useEffect } from 'react';

/**
 * Preload important assets so that subsequent navigations feel instant.
 * Supports image and video sources. Videos are preloaded with a detached element
 * to avoid layout shifts while still warming the cache.
 */
const useAssetPreloader = (assets = []) => {
  useEffect(() => {
    if (!assets.length) return undefined;

    const preloadImage = (src) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = src;
    };

    const preloadVideo = (src) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = src;
      video.load();
    };

    const preloader = () => {
      assets.forEach(({ src, type }) => {
        if (!src) return;

        if (type === 'video') {
          preloadVideo(src);
          return;
        }

        preloadImage(src);
      });
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preloader, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }

    const timeoutId = window.setTimeout(preloader, 0);
    return () => window.clearTimeout(timeoutId);
  }, [assets]);
};

export default useAssetPreloader;
