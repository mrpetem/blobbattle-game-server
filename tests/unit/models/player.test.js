const Player = require('@models/player');
const redisInterface = require('@databases/redisInterface');
const dynamoDBInterface = require("@databases/dynamoDbInterface");


describe('Player Model Tests', () => {

    const testPlayer = {
        socketId: 'test-uuid-socketid',
        username: 'TestUsername123'
    }


    test('should instantiate a new player object with correct default values', () => {
        const player = new Player(testPlayer.socketId, testPlayer.username);
        expect(typeof player.id).toBe('string');
        expect(player.socketId).toBe(testPlayer.socketId);
        expect(player.username).toBe(testPlayer.username);
        expect(player.ready).toBe(false);
        expect(typeof player.rank).toBe('string');
        expect(player.points).toBe(0);
        expect(player.totalGames).toBe(0);
        expect(player.health).toBe(100);
        expect(player.passiveAbilities).toEqual([]);
        expect(player.currentAbility).toBe('');
    });


    describe('cleanUsername tests', () => {

        // Example test cases
        const testCases = [
            { input: 'normalUsername', expected: 'normalUsername' },
            { input: 'normalUsername123', expected: 'normalUsername123' },
            { input: '123Normal_Username', expected: '123Normal_Username' },
            { input: '123 Normal Username', expected: '123 Normal Username' },
            { input: 'n1gger', expected: '******' }, 
            { input: 'YouAreAsshole', expected: 'YouAre*******' },
            { input: 'YouAreasshole', expected: 'YouAre*******' },
            { input: '!asshole!', expected: '*******' },
            { input: '!asshole123', expected: '*******123' }
        ];
    
        testCases.forEach(({ input, expected }) => {
            test(`should transform '${input}' to '${expected}'`, () => {
                const player = new Player('socketId', input);
                expect(player.username).toBe(expected);
            });
        });
    
    });
    

    test('updatePlayerPoints should increment the players points and also change their rank', () => {
        const player = new Player('socketId', 'username');

        expect(player.points).toBe(0);
        expect(player.rank).toBe('Rookie');

        player.updatePlayerPoints(1);

        expect(player.points).toBe(2);
        expect(player.rank).toBe('Rookie');

        player.updatePlayerPoints(1);
        player.updatePlayerPoints(1);
        player.updatePlayerPoints(1);
        player.updatePlayerPoints(1);

        expect(player.points).toBe(10);
        expect(player.rank).toBe('Private');

        player.updatePlayerPoints(1);
        player.updatePlayerPoints(1);
        player.updatePlayerPoints(1);
        player.updatePlayerPoints(1);
        player.updatePlayerPoints(1);

        expect(player.points).toBe(20);
        expect(player.rank).toBe('Lieutenant');

        player.updatePlayerPoints(4);

        expect(player.points).toBe(18);
        expect(player.rank).toBe('Corporal');

    });


    test('convertPointsToRank should return correct rank', () => {
        const player = new Player('socketId', 'username');
        expect(player.convertPointsToRank(4)).toBe('Rookie');
        expect(player.convertPointsToRank(9)).toBe('Initiate');
        expect(player.convertPointsToRank(34)).toBe('Captain');
    });

});
