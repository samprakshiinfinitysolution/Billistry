const http = require('http');
const fs = require('fs');

const id = process.argv[2] || '68ebc38b4b9cc0d9690527cf';
const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/download-invoice/${id}`,
  method: 'GET',
  headers: {
    'Accept': 'application/pdf'
  }
};

const req = http.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    console.log('received bytes:', buf.length);
    fs.writeFileSync(`invoice-${id}.pdf`, buf);
    console.log('saved invoice-', id, '.pdf');
  });
});
req.on('error', (e) => { console.error('request error', e); });
req.end();
