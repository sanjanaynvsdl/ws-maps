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

// Track connected clients
let connectedClients = 0;
// Store last known location
let lastLocation = null;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  connectedClients++;
  
  // Send last known location to newly connected client
  if (lastLocation) {
    console.log('Sending last known location to new client:', socket.id);
    socket.emit('locationUpdate', lastLocation);
  }

  // When a device sends its location
  socket.on('location', (data) => {
    console.log(`Received location from ${socket.id}:`, data);
    
    // Store the last location
    lastLocation = data;
    
    // Broadcast to all clients except sender
    socket.broadcast.emit('locationUpdate', data);
    
    // Also send confirmation back to sender
    socket.emit('locationUpdate', data);
    
    // Send periodic pings to keep connections alive
    setTimeout(() => {
      io.emit('ping', { timestamp: Date.now() });
    }, 5000);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients--;
  });
});

// Send periodic ping to all clients to keep connections alive
setInterval(() => {
  if (connectedClients > 0) {
    console.log(`Sending ping to ${connectedClients} clients`);
    io.emit('ping', { timestamp: Date.now() });
  }
}, 30000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
