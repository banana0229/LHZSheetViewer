import { decrypt } from './js/decryptor.js';

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.enc')) {
    event.respondWith((async () => {
      const res = await fetch(url.pathname, { cache: 'no-store' });
      const buffer = await res.arrayBuffer();
      const fullData = new Uint8Array(buffer);

      // Range header
      const range = event.request.headers.get('Range');
      let start = 0;
      let end = fullData.length - 1;
      let status = 200;
      const headers = {};

      if (range) {
        const matches = /bytes=(\d+)-(\d*)/.exec(range);
        if (matches) {
          start = parseInt(matches[1]);
          if (matches[2]) end = parseInt(matches[2]);
          status = 206;
          headers['Content-Range'] = `bytes ${start}-${end}/${fullData.length}`;
        }
      }

      const chunk = fullData.slice(start, end + 1);

      decrypt(chunk);

      // MIME
      let mime = 'audio/mpeg';
      if (url.pathname.endsWith('.ogg.enc')) mime = 'audio/ogg';
      else if (url.pathname.endsWith('.wav.enc')) mime = 'audio/wav';
      else if (url.pathname.endsWith('.flac.enc')) mime = 'audio/flac';

      headers['Content-Type'] = mime;
      headers['Cache-Control'] = 'no-store';
      headers['Accept-Ranges'] = 'bytes';

      return new Response(chunk, {
        status: status,
        statusText: status === 206 ? 'Partial Content' : 'OK',
        headers: headers
      });
    })());
  }
});