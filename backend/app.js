const express = require('express');
const http = require('http');
const Server = require('socket.io').Server
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

const { userRouter } = require('./routes/users.routes');
const { Authrouter } = require('./routes/auth.route');
const { documentrouter } = require('./routes/doc.route');
const { notificationrouter } = require('./routes/notification.route');
const { messageModel } = require('./Models/message.model');
require('./middleware/passport')(passport); // Import passport middleware
const Chat = require('./Models/chat');

const app = express();

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      origin: "*"
  }
})


// Set the io instance to app.locals for global access
app.locals.io = io;

io.on("connection", (socket) => {
  console.log("connected");

  const loadMessages = async () => {
    try {
        const messages = await Chat.find().sort({timeStamp : 1}).exec();
        socket.emit('chat', messages)
    } catch(err) {
        console.log(err)
    }
}
  loadMessages();

  socket.on('newMessage', async (msg) => {
      try {
          const newMessage = new Chat(msg)
          await newMessage.save()
          io.emit('message', msg)
      }catch(err) {
          console.log(err)
      }
  })

  socket.on("disconnect", () => {
      console.log("disconnect")
  })
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Define routes
app.use('/api', [userRouter, Authrouter]);
app.use('/documentrequest', documentrouter);
app.use('/notificationrequest', notificationrouter);


app.post('/sendmessage', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  // Check if the body is undefined or if the required fields are missing
  if (!req.body || !senderId || !receiverId || !message) {
    return res.status(400).send('Invalid request: Missing senderId, receiverId, or message');
  }

  try {
    // Save the message to the database
    const newMessage = new messageModel({ senderId, receiverId, message });
    await newMessage.save();

    // Emit the message to the corresponding room (via Socket.io)
    const room = [senderId, receiverId].sort().join('-');
    req.app.locals.io.to(room).emit('newMessage', newMessage); // Emit message to the correct room

    res.status(200).json({ success: true, message: 'Message sent and saved', newMessage });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB connection error:', err));

// Export app and server
module.exports = { app, server, io };
