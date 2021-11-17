const express = require('express');
const chokidar = require('chokidar');
const fs = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const { Server } = require('socket.io');
const io = new Server(server);

const databaseFile = "./db.json";
let database = {};

io.on("connection", (socket) => {
    console.log("Cliente conectado!!!");

    socket.on("database", (data) => {
      if (data.eventType == "getRequest") {
        socket.emit("database", {
          eventType: "getResponse",
          database,
        });
      }
    });

    socket.on("database", (data) => {
      if (data.eventType == "setRequest") {
        try {
          const tempData = data.database;

          if (tempData == null) {
            tempData = {};
          }

          database = tempData;
          fs.writeFileSync(databaseFile, JSON.stringify(database));

          socket.emit("database", {
            eventType: "setResponse",
            result: "ok",
          });
        } catch (e) {
          console.log(e);

          socket.emit("database", {
            eventType: "setResponse",
            result: e.toString(),
          });
        }
      } else if (data.eventType == "updateRequest") {
        try {
          const updatePath = data.updatePath;
          const updateValue = data.updateValue;

          if (updatePath == null || updateValue == null || updatePath === "") {
            throw new Error("updatePath or updateValue is null");
          }

          const path = updatePath.split("/");

          // nome/teste1/teste2
          let temp = database;
          for (let i = 0; i < path.length-1; i++) {
            temp = temp[path[i]];
          }

          temp[path[path.length-1]] = updateValue;

          fs.writeFileSync(databaseFile, JSON.stringify(database));

          socket.emit("database", {
            eventType: "updateResponse",
            result: "ok",
          });
        } catch (e) {
          console.log(e);

          socket.emit("database", {
            eventType: "updateResponse",
            result: e.toString(),
          });
        }
      }
    });

    // socket.emit("boasvindas", "Bem vindo ao meu servidor Socket.io!");

    // socket.on("teste", (data) => {
    //     console.log(data);
    // })
});

// Servidor web da página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// monitora o arquivo do "banco de dados"

chokidar.watch(databaseFile).on('all', (event, path) => {
  if (event === "add" || event === "change") {
    database = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));

    console.log(database);

    io.emit("database", {
      eventType: "updateResponse",
      database,
    });
  }
});

// bota o servidor pra rodar!!!
server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});