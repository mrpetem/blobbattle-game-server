# BlobBattle Game Server

This project is a game server for BlobBattle, a multiplayer online game where players control blobs and battle against each other. The server is built with Node.js and uses Socket.IO for real-time, bidirectional communication between the server and the clients.

## Key Components

### SocketService

The `SocketService` class is responsible for handling all socket-related operations. It sets up socket listeners for various events such as `joinLobby`, `joinGame`, `disconnect`, `selectPosition`, and `animationsCompleted`. 

When a player joins the lobby or a game, the server loads the player's data, adds them to the lobby or game, and emits a response back to the client. If a player disconnects, the server removes them from the lobby or game and notifies other services to update their states accordingly.

### MatchmakingService

The `MatchmakingService` class is responsible for matching players into games. When there are enough players in the lobby, the matchmaking service creates a new game, moves the players from the lobby to the game, and notifies them to confirm their readiness. If all players are ready, the game starts; otherwise, the players are moved back to the lobby and the game is destroyed.

## How to Run

To run the server, you need to have Node.js installed on your machine. Then, you can clone the repository, install the dependencies, and start the server:

```bash
git clone https://github.com/mrpetem/blobbattle-server.git
cd blobbattle-server
npm install
npm start
```

## Testing

This project uses jest. You can run tests as such:

```bash
npm test
npm test gameService.test
npm test integrations/socketService.test
```


The server will start and listen for connections on the specified port.

## Contributing

Contributions are welcome! Please read the [contributing guide](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
