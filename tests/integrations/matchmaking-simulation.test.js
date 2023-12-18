/**const ioClient = require('socket.io-client');
const { server } = require('../src/app'); // Import the server
const { v4: uuidv4 } = require('uuid');



describe('Multiple Player Simulation', () => {
    let clientSockets = [];
    const totalPlayers = 4;
    const testPort = 3001; // Ensure this port is free
    let lobbyJoinedCount = 0;
    let gameReadyCount = 0;

    beforeAll((done) => {
        server.listen(testPort, done);
    });

    afterAll((done) => {
        clientSockets.forEach(socket => {
            if (socket.connected) {
                socket.disconnect();
            }
        });
        server.close(done);
    });

    test('simulate multiple players joining and receiving events', (done) => {
        const connectClientsSequentially = (index = 0) => {
            if (index < totalPlayers) {
                const clientSocket = ioClient(`http://localhost:${testPort}`);

                clientSocket.on('connect', () => {
					let playerId = uuidv4();
                    clientSocket.emit('joinLobby', playerId, `testUsername${index}`);
                    clientSockets.push(clientSocket);

                    setTimeout(() => connectClientsSequentially(index + 1), 500); // 500ms delay between each connection
                });
				
				clientSocket.on('gameReadyCheck', (data) => {
					gameReadyCount++;
					if (gameReadyCount === totalPlayers) {
						expect(gameReadyCount).toBe(totalPlayers);
						done();
					}
				});

                clientSocket.on('lobbyJoined', (data) => {
                    lobbyJoinedCount++;
                    // Additional logic or assertions for 'lobbyJoined' event
                });
            }
        };

        // Start connecting clients
        connectClientsSequentially();
    });

    // Optional: set a timeout for the test
    setTimeout(() => {
        if (gameReadyCount < totalPlayers) {
            done(new Error('Not all players received the gameReadyCheck event'));
        }
    }, 10000); // Adjust timeout as needed
});
*/