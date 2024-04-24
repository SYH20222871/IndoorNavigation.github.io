const net = require('net');
const dgram = require('dgram');
const { createCanvas } = require('canvas');

const hostname = require('os').hostname();
const UDP_IP = require('dns').lookup(hostname, (err, address) => {
  if (err) throw err;
  console.log("***Local ip:" + address + "***");
  return address;
});
const UDP_PORT = 80;
const server = net.createServer();
server.listen(UDP_PORT, UDP_IP);

let distance_a1_a2 = 3.0;
let meter2pixel = 100;
let range_offset = 0.9;

const canvas = createCanvas(1200, 800);
const ctx = canvas.getContext('2d');

function drawLine(x0, y0, x1, y1, color = "black") {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawFastU(x, y, length, color = "black") {
  drawLine(x, y, x, y + length, color);
}

function drawFastV(x, y, length, color = "black") {
  drawLine(x, y, x + length, y, color);
}

function drawCircle(x, y, r, color = "black") {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function fillCircle(x, y, r, color = "black") {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function writeText(x, y, txt, color = "black", fontSize = 12) {
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(txt, x, y);
}

function drawRect(x, y, w, h, color = "black") {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function fillRect(x, y, w, h, color = "black") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawUwbAnchor(x, y, txt, range) {
  let r = 20;
  fillCircle(x, y, r, "green");
  writeText(x + r, y, `${txt}: ${range}M`, "black", 16);
}

function drawUwbTag(x, y, txt) {
  let pos_x = -250 + (x * meter2pixel);
  let pos_y = 150 - (y * meter2pixel);
  let r = 20;
  fillCircle(pos_x, pos_y, r, "blue");
  writeText(pos_x, pos_y, `${txt}: (${x},${y})`, "black", 16);
}

function readData(socket) {
  socket.on('data', (data) => {
    let line = data.toString('UTF-8');
    let uwbList = [];

    try {
      let uwbData = JSON.parse(line);
      console.log(uwbData);

      uwbList = uwbData["links"];
      uwbList.forEach(uwbAnchor => {
        console.log(uwbAnchor);
      });
    } catch (e) {
      console.log(line);
    }
    console.log("");

    return uwbList;
  });
}

function tagPos(a, b, c) {
  let cos_a = (b * b + c * c - a * a) / (2 * b * c);
  let x = b * cos_a;
  let y = b * Math.sqrt(1 - cos_a * cos_a);

  return [x.toFixed(1), y.toFixed(1)];
}

function uwbRangeOffset(uwbRange) {
  let temp = uwbRange;
  return temp;
}

function main() {
  server.on('connection', (sock) => {
    let a1_range = 0.0;
    let a2_range = 0.0;

    setInterval(() => {
      let nodeCount = 0;
      let list = readData(sock);

      list.forEach(one => {
        if (one["A"] === "1782") {
          clear();
          a1_range = uwbRangeOffset(parseFloat(one["R"]));
          drawUwbAnchor(-250, 150, "A1782(0,0)", a1_range);
          nodeCount++;
        }

        if (one["A"] === "1783") {
          clear();
          a2_range = uwbRangeOffset(parseFloat(one["R"]));
          drawUwbAnchor(-250 + meter2pixel * distance_a1_a2, 150, `A1783(${distance_a1_a2})`, a2_range);
          nodeCount++;
        }
      });

      if (nodeCount === 2) {
        let [x, y] = tagPos(a2_range, a1_range, distance_a1_a2);
        console.log(x, y);
        clear();
        drawUwbTag(x, y, "TAG");
      }
    }, 100);
  });
}

if (require.main === module) {
  main();
}


