const http = require('http');
const app = require('./vercel');


http.createServer(app).listen(process.env.PORT || 3000);