const Koa = require('koa');
const fetchCover = require('./douban');
const stores = require('./store');

const { STORE_TYPE = 'vercel' } = process.env;
const app = new Koa();

app.use(async (ctx) => {
  ctx.type = 'image/jpg';
  const reg = /^\/(movie|book|music|game|celebrity)\/(\d+)\.jpg$/i;
  const match = ctx.path.match(reg);
  if (!match) {
    return;
  }

  const store = stores[STORE_TYPE];
  if (!store) {
    return;
  }
  
  const [_, type, id] = match;
  const filename = ctx.path;

  const cacheFile = await store.get(filename, ctx);
  if (cacheFile && typeof cacheFile !== 'boolean') {
    ctx.body = cacheFile;
    return;
  }

  const file = await fetchCover({ type, id });
  await store.set(filename, file);

  ctx.body = Buffer.from(file);
});

module.exports = app.callback();
