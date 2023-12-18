require('module-alias/register');
const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

// Third Party Libraries
const socketIo = require('socket.io');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server);

// Manage comms with players
const SocketService = require('../services/socketService');
new SocketService(io);

// Start the server
if (require.main === module) {
    // Server will only start if this file is the entry point to the application
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}