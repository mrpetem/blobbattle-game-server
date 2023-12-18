const Game = require('@models/game');
const Abilities = require('@models/abilities');
const { validate: uuidValidate } = require('uuid');

jest.mock('@models/abilities', () => ({
    selectRandomAbility: jest.fn(() => 'newAbility'),
}));

describe('Game Model Tests', () => {
    let players;
    let game;

    beforeAll(() => {
        // Mock players data
        players = [
            { id: 'player1', publicId: 'test1', socketId: 'socketId1', username: 'Player1' },
            { id: 'player2', publicId: 'test2', socketId: 'socketId2', username: 'Player2' },
            // Add more mock players as needed
        ];

    });

    beforeEach(() => {
        game = new Game(players);
    });

    describe('gameInstance', () => {
        test('Game instance is created correctly', () => {
            expect(game).toBeDefined();
            expect(game).toBeInstanceOf(Game);
            expect(uuidValidate(game.id)).toBe(true);
            expect(game.gameStarted).toBe(false);
            expect(game.currentRound).toBe(0);
            expect(Array.isArray(game.players)).toBe(true);
            expect(game.players.length).toBe(players.length);
            expect(game.currentPlayerTurn).toBeGreaterThanOrEqual(0);
            expect(game.currentPlayerTurn).toBeLessThan(players.length);
            expect(Array.isArray(game.map)).toBe(true);
            expect(game.map.length).toBe(6);
            game.map.forEach(row => {
                expect(row.length).toBe(15);
            });
        });

        describe('Game Model with initialState', () => {
            let game;
            let initialState = {
                id: 'testId',
                gameStarted: true,
                gameStartTime: new Date().toISOString(),
                currentRound: 2,
                players: [
                    { id: 'player1', name: 'Player 1' },
                    { id: 'player2', name: 'Player 2' }
                ],
                currentPlayerTurn: 1,
                map: Array(6).fill().map(() => Array(15).fill(null))
            };
        
            beforeEach(() => {
                game = new Game([], initialState);
            });
        
            test('constructor with initialState', () => {
                expect(game).toBeInstanceOf(Game);
                expect(game.id).toBe(initialState.id);
                expect(game.gameStarted).toBe(initialState.gameStarted);
                expect(game.gameStartTime).toBe(initialState.gameStartTime);
                expect(game.currentRound).toBe(initialState.currentRound);
                expect(game.players).toEqual(initialState.players);
                expect(game.currentPlayerTurn).toBe(initialState.currentPlayerTurn);
                expect(game.map).toEqual(initialState.map);
            });
        
            test('getGameState with initialState', () => {
                const gameState = game.getGameState();
                expect(gameState).toEqual(initialState);
            });
        });
    });


    describe('getGameState', () => {
        test('should return valid properties of the game state', () => {
            const gameState = game.getGameState();
            expect(gameState).toHaveProperty('id');
            expect(gameState).toHaveProperty('gameStarted', false);
            expect(gameState).toHaveProperty('gameStartTime');
            expect(gameState).toHaveProperty('currentRound', 0);
            expect(gameState).toHaveProperty('players');
            expect(gameState.players).toHaveLength(players.length);
            expect(gameState).toHaveProperty('currentPlayerTurn', 0);
            expect(gameState).toHaveProperty('map');
            gameState.map.forEach(row => {
                expect(row).toHaveLength(15);
            });
        });
    });


    describe('cleanSensitivePlayerData', () => {
        it('should remove socketId and id from each player', () => {
            // Arrange
            const players = [
                { publicId: 'Player 1', username: 'Player 1', socketId: '123', id: '1' },
                { publicId: 'Player 1', username: 'Player 2', socketId: '456', id: '2' },
            ];
            const game = new Game(players);

            // Act
            const cleanedPlayers = game.cleanSensitivePlayerData(players);

            // Assert
            cleanedPlayers.forEach(player => {
                expect(player).not.toHaveProperty('socketId');
                expect(player).not.toHaveProperty('id');
                expect(player).toHaveProperty('publicId');
                expect(player).toHaveProperty('username');
            });
        });
    });


    describe('randomizePlayerOrder', () => {
        test('Player order is randomized', () => {
            // This test assumes that the randomizePlayerOrder method changes the order of players
            // Since the method involves randomness, this test might need to be adjusted based on its implementation
            expect(game.players).not.toEqual(players);
        });
    });


    describe('initGameMap', () => {
        test('Game map is initialized correctly', () => {
            console.log("game.map:", game.map);

            game.map.forEach((row, rowIndex) => {
                row.forEach(square => {
                    if (rowIndex < 3) {
                        // In the first 3 rows, expect a string (ability)
                        expect(typeof square).toBe('string');
                    } else {
                        // In the remaining rows, the square can be null or a string
                        expect(square === null).toBe(true);
                    }
                });
            });

        });
    });


    describe('validateMapRow', () => {
        it('should validate a map row correctly', () => {
            // Arrange
            const game = new Game([]);
            const mapRow = ['ability1', 'ability2', 'ability3', 'ability4', '', ''];

            // Act
            const result = game.validateMapRow(mapRow);

            // Assert
            let totalAbilities = 0;
            let totalBlankSpaces = 0;
            for (const cell of result) {
                if (cell.length > 0) {
                    totalAbilities++;
                } else if (cell == '') {
                    totalBlankSpaces++;
                }
            }
            expect(totalAbilities).toBeGreaterThanOrEqual(4);
            expect(totalBlankSpaces).toBeGreaterThanOrEqual(2);
        });

        it('should replace a map row when there are not enough blank spaces', () => {
            // Arrange
            const game = new Game([]);
            const mapRow = ['ability1', 'ability2', 'ability3', 'ability4', 'ability5', 'ability6'];
            let callCount = 0;
            Abilities.selectRandomAbility.mockImplementation(() => {
                callCount++;
                // Return a mix of abilities and blank spaces
                if (callCount % 3 === 0) {
                    return '';
                } else {
                    return 'newAbility';
                }
            });

            // Act
            const result = game.validateMapRow(mapRow);

            // Assert
            let totalAbilities = 0;
            let totalBlankSpaces = 0;
            for (const cell of result) {
                if (cell.length > 0) {
                    totalAbilities++;
                } else if (cell == '') {
                    totalBlankSpaces++;
                }
            }
            expect(totalAbilities).toBeGreaterThanOrEqual(4);
            expect(totalBlankSpaces).toBeGreaterThanOrEqual(2);
            expect(Abilities.selectRandomAbility).toHaveBeenCalled();
        });

    });


    describe('addNewMapRow', () => {
        it('should add a new row at the beginning and remove the last row', () => {
            // Arrange
            const game = new Game([]);
            const initialMap = JSON.parse(JSON.stringify(game.map)); // Deep copy of the initial map
            Abilities.selectRandomAbility.mockReturnValue('newAbility');

            // Act
            const newRow = game.addNewMapRow();

            // Assert
            expect(game.map.length).toEqual(initialMap.length); // The map should still have the same number of rows
            expect(game.map[0]).toEqual(newRow); // The new row should be at the beginning of the map
            expect(game.map[game.map.length - 1]).toEqual(initialMap[initialMap.length - 2]); // The last row of the new map should be the second last row of the initial map
        });
    });


    describe('removeAbilityFromMap', () => {
        it('should remove an ability from the specified location', () => {
            // Arrange
            const game = new Game([]);
            const row = 2;
            const column = 3;
            game.map[row][column] = 'ability'; // Set an ability at the specified location

            // Act
            game.removeAbilityFromMap(row, column);

            // Assert
            expect(game.map[row][column]).toEqual(''); // The specified location should now be empty
        });
    });


    describe('newGameRound', () => {
        it('should increment currentPlayerTurn or reset it to 0', () => {
            // Arrange
            const game = new Game([]);
            game.currentPlayerTurn = 2;

            // Act
            game.newGameRound();

            // Assert
            expect(game.currentPlayerTurn).toEqual(3); // currentPlayerTurn should have been incremented

            // Act
            game.currentPlayerTurn = 4;
            game.newGameRound();

            // Assert
            expect(game.currentPlayerTurn).toEqual(0); // currentPlayerTurn should have been reset to 0
        });
    });
});
