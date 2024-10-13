const path = require('path');
const { put, head } = require('@vercel/blob');

const { STORE_PATH = '' } = process.env;

function buildPath(pathname, filename = 'poster') {
  return path.join(STORE_PATH, pathname).replace(/(\.[^.]+)$/i, `/${filename}$1`);
}

function buildBlobUrl(filename) {
  const { BLOB_READ_WRITE_TOKEN } = process.env;
  const match = BLOB_READ_WRITE_TOKEN.match(/^vercel_blob_rw_([^_]+?)_[^_]+?$/);
  if (!match || !match?.[1]) {
    return;
  }

  const readToken = match[1];
  return path.join(`https://${readToken}.public.blob.vercel-storage.com`, buildPath(filename));

}
module.exports = {
  async get(filename, ctx) {
    try {
      const blobUrl = buildBlobUrl(filename);
      if (!blobUrl) {
        return;
      }

      console.log('lizheming:get:blobUrl', buildBlobUrl(filename));
      const blobDetails = await head(buildBlobUrl(filename));
      console.log('lizheming:get', blobDetails);
      if (!blobDetails?.downloadUrl) {
        return;
      }

      ctx.redirect(blobDetails.downloadUrl.replace('?download=1', ''));
      return true;
    } catch(e) {
      console.log(e);
      return;
    }
  },
  async set(filename, data) {
    const resp = await put(buildPath(filename), data, { access: 'public', addRandomSuffix: false });
    console.log('lizheming:set', resp);
    return resp;
  }
}