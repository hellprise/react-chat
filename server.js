const express = require("express"); // подключили express

const app = express(); // создали приложение
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.json()); // с помощью этой строчки мы сможем отправлять на сервер контент, который был написан юзером в формах.

const rooms = new Map();

app.get("/rooms/:id", (req, res) => {
  // в req хранится всё, что присылает нам пользователь, а в res то, что мы(сервер) отправляем
  const { id: roomId } = req.params;
  const obj = rooms.has(roomId)
    ? {
        users: [...rooms.get(roomId).get("users").values()],
        messages: [...rooms.get(roomId).get("messages").values()],
      }
    : { users: [], messages: [] };
  res.json(obj);
}); // по переходу на адрес '/users' будет выполнятсья анонимная ф-ция, которая указана после адреса

app.post("/rooms", (req, res) => {
  // в req хранится всё, что присылает нам пользователь, а в res то, что мы(сервер) отправляем
  const { roomId, userName } = req.body;
  if (!rooms.has(roomId)) {
    rooms.set(
      roomId,
      new Map([
        ["users", new Map()],
        ["messages", []],
      ])
    );
  }
  res.send();
});

io.on("connection", (socket) => {
  socket.on("ROOM:JOIN", ({ roomId, userName }) => {
    socket.join(roomId); // подключаемся в определённую комнату
    rooms.get(roomId).get("users").set(socket.id, userName); // находим каку-либо комнату, в которой находим пользователей и подключаемся
    const users = [...rooms.get(roomId).get("users").values()]; // также находим комнату, получаем коллекцию всех пользователей в ней, но также мы получаем никнеймы всех польхователей
    socket.broadcast.to(roomId).emit('ROOM:SET_USERS', users); // broadcast отправляет сообщения всем, кроме меня самого
  });

  socket.on("ROOM:NEW_MESSAGE", ({ roomId, userName, text }) => {
    const obj = {
      userName,
      text,
    };
    rooms.get(roomId).get("messages").push(obj);
    socket.broadcast.to(roomId).emit('ROOM:NEW_MESSAGE', obj)
  });

  socket.on("disconnect", () => {
    rooms.forEach((value, roomId) => {
      if (value.get("users").delete(socket.id)) {
        const users = [...value.get("users").values()];
        socket.to(roomId).broadcast.emit("ROOM:SET_USERS", users);
      }
    });
  });

  console.log("user connected", socket.id);
});

server.listen(9999, (err) => {
  if (err) {
    throw Error(err);
  }
  console.log("Сервер запущен!");
}); // по порту, который указан в скобках мы будем следить за приложением
