const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello world from socket server!");
  });

  server.listen(process.env.PORT || 4000, () => {
    console.log(` Socket server is running on port http://localhost:${process.env.PORT || 4000}`);
  });
