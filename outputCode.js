const net = require('net');
const os = require('os');
const dgram = require('dgram');

const hostname = os.hostname();
const UDP_IP = dgram.createSocket('udp4').address().address;
console.log("***Local ip:" + UDP_IP + "***");
const UDP_PORT = 80;
const server = net.createServer();
server.listen(UDP_PORT, UDP_IP);

server.on('connection', (socket) => {
    function readData() {
        socket.on('data', (data) => {
            const line = data.toString('UTF-8');
            let uwbList = [];
            try {
                const uwbData = JSON.parse(line);
                console.log(uwbData);
                uwbList = uwbData["links"];
                uwbList.forEach(uwbAnchor => {
                    const anchorId = uwbAnchor["A"];
                    const distance = parseFloat(uwbAnchor["R"]);
                    
                    console.log("Distance for Anchor " + anchorId + ": " + distance);
                });
            } catch (error) {
                console.log(line);
            }
            console.log("");
            return uwbList;
        });
    }

    function main() {
        setInterval(() => {
            const list = readData();
        }, 100);
    }

    main();
});


