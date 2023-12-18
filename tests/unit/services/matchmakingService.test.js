const matchmakingService = require('@services/matchmakingService');
const lobbyService = require('@services/lobbyService');
const gameService = require('@services/gameService');
const playerService = require('@services/playerService');

jest.mock('@services/lobbyService');
jest.mock('@services/gameService');
jest.mock('@services/playerService');

describe('MatchmakingService', () => {

    beforeEach(() => {
    });

    afterEach(() => {
    });

    describe('registerObservers', () => {
        it('should register observers correctly', () => {
            const observers = {
                observer1: jest.fn(),
                observer2: jest.fn(),
            };

            matchmakingService.registerObservers(observers);

            expect(matchmakingService.observers).toEqual(observers);
        });
    });

    describe('removeObserver', () => {
        it('should remove observer correctly', () => {
            const observers = {
                observer1: jest.fn(),
                observer2: jest.fn(),
            };

            matchmakingService.registerObservers(observers);
            matchmakingService.removeObserver('observer1');

            expect(matchmakingService.observers).toEqual({ observer2: observers.observer2 });
        });
    });

    describe('tryMatchmaking', () => {
        it('should try matchmaking correctly', async () => {
            const players = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

            lobbyService.getAvailablePlayers.mockResolvedValue(players);
            gameService.createNewGame.mockResolvedValue({ id: 1, players: [] });
            gameService.arePlayersReadyToStartGame.mockResolvedValue(true);

            const observers = {
                onGameReadyCheck: jest.fn(), // Add this line
            };

            matchmakingService.registerObservers(observers);

            const result = await matchmakingService.tryMatchmaking();

            expect(result).toBeTruthy();
            expect(lobbyService.getAvailablePlayers).toHaveBeenCalledWith(4);
            expect(gameService.createNewGame).toHaveBeenCalledWith(players);
        },20000);
    });


    describe('waitForLobbyUnlocked', () => {
        it('should wait until the lobby is unlocked', async () => {
            const lobbyLockedStates = [true, true, false]; // Lobby is locked twice, then unlocked
            lobbyService.isLobbyLocked.mockImplementation(() => Promise.resolve(lobbyLockedStates.shift()));

            const promise = matchmakingService.waitForLobbyUnlocked();

            // Now our promise should be resolved (because the lobby is unlocked)
            await expect(promise).resolves.toBeUndefined();
        });

        it('should throw an error if the lobby remains locked for too long', async () => {
            lobbyService.isLobbyLocked.mockResolvedValue(true); // Lobby is always locked

            const promise = matchmakingService.waitForLobbyUnlocked();

            // Now our promise should be rejected (because the lobby remained locked for too long)
            await expect(promise).rejects.toThrow("Lobby has been locked for too long.");
        });
    });

    describe('initializeGameIfReady', () => {
        it('should initialize game if there are enough players', async () => {
            const players = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
            const game = { id: 1, players };

            gameService.createNewGame.mockResolvedValue(game);
            gameService.arePlayersReadyToStartGame.mockResolvedValue(true);

            const observers = {
                onGameReadyCheck: jest.fn(),
            };

            matchmakingService.registerObservers(observers);

            const result = await matchmakingService.initializeGameIfReady(players);

            expect(result).toBeTruthy();
            expect(lobbyService.lockLobby).toHaveBeenCalledWith(true);
            expect(gameService.createNewGame).toHaveBeenCalledWith(players);

            players.forEach(player => {
                expect(lobbyService.removePlayerFromLobbyByPlayerId).toHaveBeenCalledWith(player.id);
            });

            expect(observers.onGameReadyCheck).toHaveBeenCalledTimes(players.length);
        },12000);

        it('should not initialize game if there are not enough players', async () => {
            const players = [{ id: 1 }, { id: 2 }, { id: 3 }];

            const result = await matchmakingService.initializeGameIfReady(players);

            expect(result).toBeFalsy();
        });
    });

    describe('handlePlayersNotReady', () => {
        it('should handle players not ready correctly', async () => {
            const players = [
                { id: 1, publicId: 'publicId1' },
                { id: 2, publicId: 'publicId2' },
                { id: 3, publicId: 'publicId3' },
                { id: 4, publicId: 'publicId4' },
            ];
            const game = { id: 1, players };

            playerService.getPlayerByPublicId.mockImplementation((publicId) => {
                return Promise.resolve(players.find(player => player.publicId === publicId));
            });

            await matchmakingService.handlePlayersNotReady(game);

            players.forEach(player => {
                expect(playerService.getPlayerByPublicId).toHaveBeenCalledWith(player.publicId);
                expect(lobbyService.addPlayerToLobby).toHaveBeenCalledWith(player);
            });
            expect(gameService.destroyGame).toHaveBeenCalledWith(game.id);
        });
    });

    describe('playerReadyForGame', () => {
        it('should handle player ready for game correctly', async () => {
            const socketId = 'socketId1';
            const playerId = 'playerId1';
            const publicId = 'publicId1';
            const gameId = 'gameId1';
            const player = { id: playerId, publicId };

            playerService.validatePlayerCredentials.mockResolvedValue(true);
            playerService.getPlayerBySocketId.mockResolvedValue(player);
            gameService.verifyPlayerExistsInGame.mockResolvedValue(true);
            gameService.startGame.mockResolvedValue(true);

            const observers = {
                onInvalidCredentials: jest.fn(),
            };

            matchmakingService.registerObservers(observers);

            const result = await matchmakingService.playerReadyForGame(socketId, playerId, publicId, gameId);

            expect(result).toBeTruthy();
            expect(playerService.validatePlayerCredentials).toHaveBeenCalledWith(socketId, playerId, publicId);
            expect(gameService.verifyPlayerExistsInGame).toHaveBeenCalledWith(gameId, publicId);
            expect(gameService.playerIsReadyForGame).toHaveBeenCalledWith(gameId, publicId);
            expect(gameService.startGame).toHaveBeenCalledWith(gameId);
            expect(observers.onInvalidCredentials).not.toHaveBeenCalled();
        });

        it('should handle player not ready for game correctly', async () => {
            const socketId = 'socketId1';
            const playerId = 'playerId1';
            const publicId = 'publicId1';
            const gameId = 'gameId1';

            playerService.validatePlayerCredentials.mockResolvedValue(false);

            const observers = {
                onInvalidCredentials: jest.fn(),
            };

            matchmakingService.registerObservers(observers);

            const result = await matchmakingService.playerReadyForGame(socketId, playerId, publicId, gameId);

            expect(result).toBeFalsy();
            expect(playerService.validatePlayerCredentials).toHaveBeenCalledWith(socketId, playerId, publicId);
            expect(observers.onInvalidCredentials).toHaveBeenCalled();
        });
    });
});