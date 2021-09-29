const express = require('express'); // подключили express

const app = express(); // создали приложение
const server = require('http').Server(app);
const io = require('socket.io')(server);

const rooms = new Map();

app.get('/rooms', (req, res) => { // в req хранится всё, что присылает нам пользователь, а в res то, что мы(сервер) отправляем
    res.json(rooms);
}); // по переходу на адрес '/users' будет выполнятсья анонимная ф-ция, которая указана после адреса

io.on('connection', (socket) => {
    console.log('user connected', socket.id);
});

server.listen(9999, (err) => {
    if (err) {
        throw Error(err);
    }
    console.log("Сервер запущен!");
}); // по порту, который указан в скобках мы будем следить за приложением

