const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');
const SocketService = require('@services/socketService');
const PlayerService = require('@services/playerService');
const util = require('@utils/utils');


let httpServer;
let httpServerAddr;
let ioServer;
let socketService;

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {
    httpServer = http.createServer().listen();
    httpServerAddr = httpServer.address();
    ioServer = ioBack(httpServer);
    socketService = new SocketService(ioServer);

    done();
});

/**
 * Cleanup WS & HTTP servers
 */
afterAll((done) => {
    if (ioServer) {
        ioServer.close();
    }
    if (httpServer) {
        httpServer.close();
    }
    done();
});

/**
 * Run before each test
 */
beforeEach((done) => {
    // Setup
    // Do not hardcode server port and address, square brackets are used for IPv6
    socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true,
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log("connected to socket");
        done();
    });
});

/**
 * Run after each test
 */
afterEach((done) => {
    // Cleanup
    if (socket && socket.connected) {
        console.log("disconnected");
        socket.disconnect();
    }
    done();
});

let playerId = 'invalid-playerid',
username = 'testUsername',
publicId = '';

describe('joinLobby', () => {

    test('should allow a new player to join the lobby', (done) => {
        
        socket.on('lobbyJoined', (data) => {

            expect(data.status).toBe('success');
            expect(data.player.id).not.toBe(playerId);
            expect(data.player.username).toBe(username);
            expect(data.player.publicId).toBeDefined();
            expect(util.validateUUID(data.player.id)).toBe(true);

            playerId = data.player.id;
            publicId = data.player.publicId;

            done();
        });

        socket.emit('joinLobby', playerId, username);
    });

    test('should allow an existing player to join the lobby', (done) => {
        
        socket.on('lobbyJoined', (data) => {
            expect(data.status).toBe('success');
            expect(data.player.id).toBe(playerId);
            expect(data.player.username).toBe(username);
            expect(data.player.publicId).toBeDefined();
            expect(util.validateUUID(data.player.id)).toBe(true);

            username = data.player.username;
            publicId = data.player.publicId;

            done();
        });

        socket.emit('joinLobby', playerId, username);
    });

    test('should allow an existing player to join the lobby with a different username', (done) => {
        
        username = 'IChangedMyUsername';

        socket.on('lobbyJoined', (data) => {
            expect(data.status).toBe('success');
            expect(data.player.id).toBe(playerId);
            expect(data.player.username).toBe(username);
            expect(data.player.publicId).toBeDefined();
            expect(util.validateUUID(data.player.id)).toBe(true);

            username = data.player.username;
            publicId = data.player.publicId;

            done();
        });

        socket.emit('joinLobby', playerId, username);
    });

    // Make sure the player was actually saved and retrieve it from playerService in this integration test
    test('should be able to get back the newly created player from database with the updated username',async () => {
        let playerFound = await PlayerService.getPlayer(playerId);

        expect(playerFound).toBeDefined();
        expect(playerFound.id).toBe(playerId);
        expect(playerFound.username).toBe(username);
        expect(playerFound.publicId).toBe(publicId);
    });
});


describe('joinGame', () => {
    
    let gameId = util.generateUUID();

    test('should allow a new player to join the game', (done) => {

        socket.on('lobbyJoined', (data) => {
            expect(data.status).toBe('success');
            expect(data.player.id).toBe(playerId);
            expect(data.player.username).toBe(username);
            expect(data.player.publicId).toBeDefined();
            expect(util.validateUUID(data.player.id)).toBe(true);

            username = data.player.username;
            publicId = data.player.publicId;

            done();
        });

        socket.emit('joinGame', playerId, publicId, gameId);
    });

    test('should not allow a player with invalid playerId to join', (done) => {
        
    });

    test('should not allow a player with invalid publicId to join', (done) => {
        
    });

    test('should not allow a player with invalid gameId to join', (done) => {
        
    });

});