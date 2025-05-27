const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.get('/', (req, res) => res.send('WebSocket server running.'));

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", 
  }
});

io.on('connection', (socket) => {
  console.log(' New client connected:', socket.id);

  socket.on('location', (data) => {
    console.log(`Received location from ${socket.id}:`, data);
    // Add redis here,
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
