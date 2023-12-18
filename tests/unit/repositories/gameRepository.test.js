const redisInterface = require('@databases/redisInterface');
const GameRepository = require('@repositories/gameRepository');
const Game = require('@models/game');

jest.mock('@databases/redisInterface');

describe('GameRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getGameById', () => {
        it('should fetch a game by ID from Redis', async () => {
            // Arrange
            const gameId = '123';
            const gameData = { id: gameId, name: 'Test Game' };
            redisInterface.getHashField.mockResolvedValue(gameData);

            // Act
            const result = await GameRepository.getGameById(gameId);

            // Assert
            //expect(result).toEqual(gameData);
            expect(result).toBeInstanceOf(Game);
            expect(redisInterface.getHashField).toHaveBeenCalledWith('game', gameId);
        });
    });

    describe('saveGameState', () => {
        it('should save a game state to Redis', async () => {
            // Arrange
            const game = new Game([]);
            redisInterface.setHash.mockResolvedValue(true);

            // Act
            const result = await GameRepository.saveGameState(game);

            // Assert
            expect(result).toBe(true);
            expect(redisInterface.setHash).toHaveBeenCalledWith('game', game.id, game);
        });

        it('should fail to save a game due to invalid instance of Game being passed', async () => {
            // Arrange
            const game = {gameId: 'test'};
            redisInterface.setHash.mockResolvedValue(true);
        
            // Act and Assert
            await expect(GameRepository.saveGameState(game)).rejects.toThrow("Invalid argument: 'game' must be an instance of Game");
        });
    });

    describe('deleteGame', () => {
        it('should delete a game from Redis', async () => {
            // Arrange
            const gameId = '123';
            const gameData = { id: gameId, name: 'Test Game' };
            GameRepository.getGameById = jest.fn().mockResolvedValue(gameData);
            redisInterface.removeHashField.mockResolvedValue(true);

            // Act
            const result = await GameRepository.deleteGame(gameId);

            // Assert
            expect(result).toEqual(gameData);
            expect(GameRepository.getGameById).toHaveBeenCalledWith(gameId);
            expect(redisInterface.removeHashField).toHaveBeenCalledWith('game', gameId);
        });
    });
});