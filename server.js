const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
var bodyParser = require("body-parser");
const cookie = require("cookie");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const socket = require("socket.io");
const io = socket(server);

var connexion = [];

io.attach(server, {
  cookie: false,
});

// io.engine.on("headers", (headers, request) => {
//   headers["set-cookie"] = cookie.serialize("room", "public");
// });

io.on("connection", (socket) => {
  socket.on("login", () => {
    const cookies = cookie.parse(socket.request.headers.cookie || "");
    var i = connexion.length;
    connexion[i] = cookies.username;
    socket.join(cookies.room);
    io.to(cookies.room).emit("id", cookies.username, connexion);
  });

  socket.on("disconnect", () => {
    const cookies = cookie.parse(socket.request.headers.cookie || "");
    for (let i = 0; i < connexion.length; i++) {
      if (connexion[i] == cookies.username) {
        connexion.splice(i, 1);
        io.to(cookies.room).emit("id", "", connexion);
      }
    }
  });

  socket.on("leave", (user) => {
    const cookies = cookie.parse(socket.request.headers.cookie || "");
    for (let i = 0; i < connexion.length; i++) {
      if (connexion[i] == user) {
        connexion.splice(i, 1);
        io.to(cookies.room).emit("id", "", connexion);
      }
    }
  });

  socket.on("chatMessagePrivate", (rooms, msg) => {
    const cookies = cookie.parse(rooms || "");
    console.log(cookies.room);
    io.to(cookies.room).emit("messagePrivate", msg, cookies.username);
  });

  socket.on("chatMessage", (rooms, msg) => {
    const cookies = cookie.parse(rooms || "");
    console.log(cookies.room);
    io.to(cookies.room).emit("messagePublic", msg, cookies.username);
  });

  socket.on("changeRoom", (room) => {
    const cookies = cookie.parse(socket.request.headers.cookie || "");
    socket.leave(cookies.room);
    if (room == "public") {
      socket.join("public");
      socket.emit("changeCookie", "public");
    } else {
      let tab_user = [cookies.username, room];
      tab_user.sort();
      let name = tab_user[0] + tab_user[1];
      socket.join(name);
      socket.emit("changeCookie", name);
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.cookie("room", "public");
  res.sendFile(__dirname + "/public/chat.html");
});

server.listen(8080, () => {
  console.log("server on 8080");
});
