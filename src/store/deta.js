const path = require('path');
const { Deta } = require('deta'); 

const { STORE_PATH = '' } = process.env;

const deta = Deta();
const drive = deta.Drive('douban');

module.exports = {
  async get(filename) {
    try {
      const data = await drive.get(path.join(STORE_PATH, filename));
      const buffer = await data.arrayBuffer();
      return Buffer.from(buffer, 'binary');
    } catch(e) {
      console.log(e);
      return;
    }
  },
  async set(filename, data) {
    return drive.put(path.join(STORE_PATH, filename), { data });
  }
}