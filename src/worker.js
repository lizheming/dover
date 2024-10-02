async function fetchSubject({type, id }, { host, apiKey, requestOptions }) {
  const url = `https://${host}/api/v2/${type}/${id}`;
  const params = new URLSearchParams({apiKey});

  return fetch(url + '?' + params.toString(), requestOptions).then((resp) => resp.json());
}

async function fetchCover({ type, id }, { host, apiKey, authToken }) {
  const requestOptions = {
    maxRedirections: 2,
    headers: {
      // host: DOUBAN_API_HOST,
      authorization: authToken ? 'Bearer ' + authToken : '',
      'user-agent': 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.16(0x18001023) NetType/WIFI Language/zh_CN',
      referer: 'https://servicewechat.com/wx2f9b06c1de1ccfca/84/page-frame.html'
    }
  };

  const subject = await fetchSubject({ type, id }, { host, apiKey, requestOptions });
  const coverUrl = type === 'celebrity' ? subject.cover_img.url : subject.cover_url;

  return fetch(coverUrl, requestOptions).then(resp => resp.arrayBuffer());
}

function base64ToArrayBuffer(base64) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

var main = {
  async fetch(request, env) {
    const { 
      DATABASE, 
      AUTH_TOKEN,
      DOUBAN_API_HOST = 'frodo.douban.com', 
      DOUBAN_API_KEY = '0ac44ae016490db2204ce0a042db2916' 
    } = env;

    const { pathname } = new URL(request.url);
    const reg = /^\/(movie|book|music|game|celebrity)\/(\d+)\.jpg$/i;
    const match = pathname.match(reg);
    if (!match) {
      return new Response(null);
    }

    const [_, type, id] = match;
    const cacheFileSQL = DATABASE.prepare(`SELECT * FROM posters WHERE id="${id}" AND type="${type}"`);
    const { results } = await cacheFileSQL.all();

    let file = results?.[0]?.content;
    if (!file) {
      file = await fetchCover({ type, id }, { host: DOUBAN_API_HOST, apiKey: DOUBAN_API_KEY, authToken: AUTH_TOKEN });
      await DATABASE
        .prepare(`INSERT INTO posters (id, type, content) VALUES (?1, ?2, ?3)`)
        .bind(id, type, btoa(String.fromCharCode(...new Uint8Array(file))))
        .run();
        
    } else {
      file = base64ToArrayBuffer(file);
    }

    return new Response(
      file,
      {
        headers: {
          "content-type": "image/jpg"
        }
      }
    );
  }
};

export {
  main as default
};
