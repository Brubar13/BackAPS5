var mongoose = require('mongoose');
var express = require('express');
var multer = require("multer");
var multerConfig = require("./middlewares/multer");
var app = express();
var http = require('http').Server(app);
var cors = require('cors')
var io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// MODELS
const Midia = require("./models/Midia");
const Message = require("./models/Message");

app.use(express.static(__dirname));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
);

app.post('/message', async (req, res) => {
  const { nick, type, content } = req.body

  const message = await Message.create({
    nick,
    type,
    content
  });

  return res.json(message);
})

app.get('/message', async (req, res) => {
  const messages = await Message.find().select('-type -createdAt');

  return res.json(messages)
});

app.post('/midiaUpload', multer(multerConfig).single("file"), async (req, res) => {
  const { originalname: name, size, key, path, location, mimetype } = req.file;

  const document = await Midia.create({
    name,
    size,
    key,
    url: location || path,
    type: mimetype
  });

  return res.json(document.url);


});

var connectedUsers = []

io.on('connection', (client) => {
  console.log('a user is connected')

  client.emit('updateList', connectedUsers)

  client.on('message.new', e => {
    e.socket = client.id
    io.emit('message.show', e)
  })

  client.on('guest.new', e => {
    let user = { ...e }
    user.socket = client.id
    connectedUsers.push(user)
    io.emit('guest.show', e)
  })

  client.on('disconnect', e => {
    console.log('disconnected socket: ', client.id)

    var disconnectedUser = connectedUsers.filter(user => user.socket === client.id)
    connectedUsers = connectedUsers.filter(user => user.socket !== client.id)

    let payload = {
      connectedUsers,
      user: disconnectedUser[0]
    }

    io.emit('leave', payload)
  })
})

var server = http.listen(process.env.PORT || 3333);