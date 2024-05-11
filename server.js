const dns = require('dns');
const net = require('net');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

dns.lookup(require('os').hostname(), { family: 4 }, (err, address) => {
  if (err) {
    console.error(err);
    return;
  }

  const UDP_IP = address;
  console.log(`***Local ip: ${UDP_IP}***`);
  const UDP_PORT = 80;
  const server = net.createServer((socket) => {
    socket.on('data', (data) => {
      const line = data.toString('utf-8');
      let uwb_list = [];
      try {
        const uwb_data = JSON.parse(line);
        console.log(uwb_data);
        uwb_list = uwb_data.links;
        for (const uwb_anchor of uwb_list) {
          const anchor_id = uwb_anchor.A;
          const distance = parseFloat(uwb_anchor.R);
          console.log(`Distance for Anchor ${anchor_id}: ${distance}`);
        }
      } catch (error) {
        console.log(line);
      }
      console.log('');
      // Send data to connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(uwb_list));
        }
      });
    });
  });

  server.listen(UDP_PORT, UDP_IP, () => {
    console.log(`Server listening on ${UDP_IP}:${UDP_PORT}`);
  });

  // Create an HTTP server to serve the HTML page
  const httpServer = http.createServer((req, res) => {
    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  });

  httpServer.listen(8080, () => {
    console.log('HTTP server running at http://localhost:8080/');
  });

  // Create a WebSocket server
  const wss = new WebSocket.Server({ server: httpServer });

  wss.on('connection', (ws) => {
    console.log('Client connected');
  });
});
