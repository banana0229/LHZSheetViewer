if ('serviceWorker' in navigator) {
  const currentPath = window.location.pathname;
  // 取當前目錄作為 scope
  const dirPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  (async () => {
    try {
      await navigator.serviceWorker.register('./sw.js', { type: 'module', scope: dirPath });
      await navigator.serviceWorker.ready;
      console.log('SW active and ready');
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  })();
}