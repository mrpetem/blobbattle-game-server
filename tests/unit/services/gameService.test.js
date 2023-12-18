const GameService = require('@services/gameService');
const GameRepository = require('@repositories/gameRepository');
const PlayerService = require('@services/playerService');
const Game = require('@models/game');

jest.mock('@repositories/gameRepository');
jest.mock('@services/playerService');
jest.mock('@models/game');

describe('GameService', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        GameRepository.getGameById.mockClear();
        GameRepository.saveGameState.mockClear();
        GameRepository.deleteGame.mockClear();
        PlayerService.getPlayerByPublicId.mockClear();
        Game.mockClear();
    });

    it('should create a new game', async () => {
        const players = ['player1', 'player2'];
        await GameService.createNewGame(players);
        expect(Game).toHaveBeenCalledWith(players);
        expect(GameRepository.saveGameState).toHaveBeenCalled();
    });

    it('should get game state', async () => {
        const gameId = 'gameId';
        await GameService.getGameState(gameId);
        expect(GameRepository.getGameById).toHaveBeenCalledWith(gameId);
    });

    it('should save game state', async () => {
        const game = new Game();
        await GameService.saveGameState(game);
        expect(GameRepository.saveGameState).toHaveBeenCalledWith(game);
    });

    it('should not start the game if a player is not ready', async () => {
        const gameId = 'gameId';
    
        // Mock the return value of getGameById
        GameRepository.getGameById.mockResolvedValue({
            players: [
                { publicId: 'publicId1', ready: true },
                { publicId: 'publicId2', ready: false } // One player is not ready
            ]
        });
    
        const result = await GameService.startGame(gameId);
        expect(GameRepository.getGameById).toHaveBeenCalledWith(gameId);
        expect(result).toBe(false); // The game should not start
    });
    
    it('should start the game if all players are ready', async () => {
        const gameId = 'gameId';
    
        // Mock the return value of getGameById
        GameRepository.getGameById.mockResolvedValue({
            players: [
                { publicId: 'publicId1', ready: true },
                { publicId: 'publicId2', ready: true } // All players are ready
            ]
        });
    
        const result = await GameService.startGame(gameId);
        expect(GameRepository.getGameById).toHaveBeenCalledWith(gameId);
        // Add additional assertions here to check that the game has started
    });

    it('should destroy a game', async () => {
        const gameId = 'gameId';
        await GameService.destroyGame(gameId);
        expect(GameRepository.deleteGame).toHaveBeenCalledWith(gameId);
    });

    it('should update player readiness for a game', async () => {
        const gameId = 'gameId';
        const publicId = 'publicId';
    
        // Mock the return value of getGameById
        GameRepository.getGameById.mockResolvedValue({
            players: [
                { publicId: 'publicId', ready: false },
                { publicId: 'publicId2', ready: true }
            ]
        });
    
        const result = await GameService.playerIsReadyForGame(gameId, publicId);
        expect(GameRepository.getGameById).toHaveBeenCalledWith(gameId);
        expect(GameRepository.saveGameState).toHaveBeenCalled();
        expect(result).toBe(true);
    });
    
    it('should check if all players are ready to start a game', async () => {
        const gameId = 'gameId';
    
        // Mock the return value of getGameById
        GameRepository.getGameById.mockResolvedValue({
            players: [
                { publicId: 'publicId', ready: true },
                { publicId: 'publicId2', ready: true }
            ]
        });
    
        const result = await GameService.arePlayersReadyToStartGame(gameId);
        expect(GameRepository.getGameById).toHaveBeenCalledWith(gameId);
        expect(result).toBe(true);
    });

    it('should verify if a player exists in a game', async () => {
        const gameId = 'gameId';
        const publicId = 'publicId';
        
        // Mock the return value of getGameById
        GameRepository.getGameById.mockResolvedValue({
            gameId: gameId,
            players: [{id: 'player1', publicId: publicId},{id: 'player2', publicId: 'unknown'}]
        });
    
        await GameService.verifyPlayerExistsInGame(gameId, publicId);
        expect(GameRepository.getGameById).toHaveBeenCalledWith(gameId);
    });
});