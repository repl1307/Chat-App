import express from 'express';
import { Server } from 'socket.io';

const app = express();
const server = app.listen(3000);
const io = new Server(server, {
  connectionStateRecovery: {}
});
const messages = [];
class Message {
  constructor(content, name, images, id){
    this.content = content;
    this.name = name;
    this.time = Date.now();
    this.id = id;
    this.images = images;
  }
}
io.on('connection', socket => {
  for(const m of messages){
    socket.emit('chat message', m);
  }
  const m = new Message('Guest-'+socket.id+' has connected', 'ChatBot3000', [], socket.id);
  m.isAnnouncement = true;
  io.emit('chat message', m);

  socket.on('chat message', (message, images, user) => {
    messages.push(new Message(message, user, images, socket.id));
      io.emit('chat message', messages.at(-1));
  });
  socket.on('disconnect', () => {
    const m = new Message('Guest-'+socket.id+' has disconnected', 'ChatBot3000', [], socket.id);
    m.isAnnouncement = true;
    io.emit('chat message', m);
  });
});

app.use(express.static('public'));

app.use('/', (req, res) => {
  res.send('index.html');
});
