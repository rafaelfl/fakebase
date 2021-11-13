const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("Cliente conectado!!!");

    io.emit("boasvindas", "Bem vindo ao meu servidor Socket.io!");

    // socket.on("teste", (data) => {
    //     console.log(data);
    // })
});

// Servidor web da página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// bota o servidor pra rodar!!!
server.listen(3000, () => {
  console.log('listening on *:3000');
});