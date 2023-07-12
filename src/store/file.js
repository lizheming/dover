const fs = require('fs/promises');
const path = require('path');

const { STORE_PATH  = path.join(__dirname, '../..//data') } = process.env;

module.exports = {
  async get(filename) {
    try {
      const data = await fs.readFile(path.join(STORE_PATH, filename), 'binary');
      return Buffer.from(data, 'binary');
    } catch(e) {
      console.log(e);
      return;
    }
  },
  set(filename, data) {
    return fs.writeFile(path.join(STORE_PATH, filename), data, 'binary');
  }
}