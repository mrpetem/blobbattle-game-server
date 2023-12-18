const SocketService = require('@services/socketService');
const playerService = require('@services/playerService');
const matchmakingService = require('@services/matchmakingService');
const lobbyService = require('@services/lobbyService');
const gameService = require('@services/gameService');

const io = require('socket.io');

jest.mock('socket.io', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    // add other methods you want to mock here
  }));
});
jest.mock('@services/playerService');
jest.mock('@services/matchmakingService');
jest.mock('@services/lobbyService');
jest.mock('@services/gameService');

describe('SocketService', () => {
    let socketService;
    let mockSocket;

    beforeEach(() => {
        mockSocket = new io();
        socketService = new SocketService(mockSocket);
    });

    it('should be a module', () => {
        expect(SocketService).toBeDefined();
    });

    it('should be instantiable', () => {
        expect(socketService).toBeInstanceOf(SocketService);
    });

    describe('methods', () => {
        it('should have a method called "registerObservers"', () => {
            expect(socketService.registerObservers).toBeDefined();
        });

        it('should have a method called "setupSocketListeners"', () => {
            expect(socketService.setupSocketListeners).toBeDefined();
        });

    });

    describe('joinLobby', () => {
        it('should emit "lobbyJoined" with status "success" when joining lobby is successful', async () => {
            const mockEmit = jest.fn();
            const mockSocket = { emit: mockEmit };
            const mockPlayerService = { loadPlayer: jest.fn().mockResolvedValue({}) };
            const mockLobbyService = { addPlayerToLobby: jest.fn().mockResolvedValue(true) };
            const mockMatchmakingService = { tryMatchmaking: jest.fn().mockResolvedValue({}) };

            playerService.loadPlayer = mockPlayerService.loadPlayer;
            lobbyService.addPlayerToLobby = mockLobbyService.addPlayerToLobby;
            matchmakingService.tryMatchmaking = mockMatchmakingService.tryMatchmaking;

            const joinLobby = socketService.joinLobby(mockSocket);
            await joinLobby('id', 'username');

            expect(mockEmit).toHaveBeenCalledWith('lobbyJoined', { status: 'success', player: {} });
        });

    });

    describe('joinGame', () => {
        it('should emit "joinGame" with status "fatal_error" when an error occurs', async () => {
            const mockEmit = jest.fn();
            const mockSocket = { emit: mockEmit };
            const mockMatchmakingService = { playerReadyForGame: jest.fn().mockRejectedValue(new Error('Error')) };

            matchmakingService.playerReadyForGame = mockMatchmakingService.playerReadyForGame;

            const joinGame = socketService.joinGame(mockSocket);
            await joinGame('playerId', 'publicId', 'gameId');

            expect(mockEmit).toHaveBeenCalledWith('joinGame', { status: 'fatal_error', retry: false });
        });

    });

    describe('disconnect', () => {
        it('should call the necessary services when a player disconnects', async () => {
            const mockSocket = { id: 'socketId' };
            const mockPlayerService = { 
                getPlayerBySocketId: jest.fn().mockResolvedValue({ id: 'playerId' }),
                playerDisconnected: jest.fn().mockResolvedValue({})
            };
            const mockLobbyService = { removePlayerFromLobbyByPlayerId: jest.fn().mockResolvedValue({}) };
            const mockGameService = { playerDisconnected: jest.fn().mockResolvedValue({}) };
            const mockMatchmakingService = { tryMatchmaking: jest.fn().mockResolvedValue({}) };

            playerService.getPlayerBySocketId = mockPlayerService.getPlayerBySocketId;
            playerService.playerDisconnected = mockPlayerService.playerDisconnected;
            lobbyService.removePlayerFromLobbyByPlayerId = mockLobbyService.removePlayerFromLobbyByPlayerId;
            gameService.playerDisconnected = mockGameService.playerDisconnected;
            matchmakingService.tryMatchmaking = mockMatchmakingService.tryMatchmaking;

            const disconnect = socketService.disconnect(mockSocket);
            await disconnect();

            expect(mockPlayerService.getPlayerBySocketId).toHaveBeenCalledWith('socketId');
            expect(mockLobbyService.removePlayerFromLobbyByPlayerId).toHaveBeenCalledWith('playerId');
            expect(mockPlayerService.playerDisconnected).toHaveBeenCalledWith('socketId');
            expect(mockGameService.playerDisconnected).toHaveBeenCalledWith('playerId');
            expect(mockMatchmakingService.tryMatchmaking).toHaveBeenCalled();
        });

    });
});