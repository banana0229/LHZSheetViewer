import { decrypt } from './js/decryptor.js';

self.addEventListener('fetch', event => {
  console.log('fetch:'+event.request.url);
  const url = new URL(event.request.url);

  // 只攔截 .enc 檔案
  if (url.pathname.endsWith('.enc')) {
    console.log('is enc file try to fetch');
    event.respondWith((async () => {
      const res = await fetch(url.pathname);
      console.log('fetch done, try to decrypt');
      const buffer = await res.arrayBuffer();
      const data = new Uint8Array(buffer);
      
      //解密
      data = decrypt(data);

      // 回傳正確 MIME
      let mime = 'audio/mpeg';
      if (url.pathname.endsWith('.ogg.enc')) mime = 'audio/ogg';
      else if (url.pathname.endsWith('.wav.enc')) mime = 'audio/wav';
      else if (url.pathname.endsWith('.flac.enc')) mime = 'audio/flac';

      return new Response(data, { headers:
        {
          'Content-Type': mime,
          'Cache-Control': 'no-store'
        }});
    })());
  }
});