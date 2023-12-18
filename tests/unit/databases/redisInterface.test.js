const redisInterface = require('@databases/redisInterface');

describe('RedisInterface', () => {
    const testHashKey = 'testHash';
    const testField = 'field1';
    const testValue = { data: 'testData' };
    const testSetKey = 'testSet';
    const testMember = 'member1';


    afterAll(async () => {
        await redisInterface.deleteKey(testHashKey);
        await redisInterface.deleteKey(testSetKey);
        await redisInterface.disconnect();
    });
	
	test('should connect to Redis successfully',async () => {
        await redisInterface.ensureConnected();
        expect(redisInterface).toBeDefined();
        expect(redisInterface.client).toBeDefined();
        expect(redisInterface.client.isOpen).toBeTruthy(); 
    });

    // Hash methods tests
    test('setHash stores a value', async () => {
        const setResult = await redisInterface.setHash(testHashKey, testField, testValue);
        expect(setResult).toBe(1); // 1 indicates a new field was added
    });

    test('getHashField retrieves a value', async () => {
        const getValue = await redisInterface.getHashField(testHashKey, testField);
        expect(getValue).toEqual(testValue);
    });

    test('getHashAllFields retrieves all fields', async () => {
        const allFields = await redisInterface.getHashAllFields(testHashKey);
        expect(allFields).toEqual({ [testField]: JSON.stringify(testValue) });
    });

    test('removeHashField removes a field', async () => {
        const removeResult = await redisInterface.removeHashField(testHashKey, testField);
        expect(removeResult).toBe(1); // 1 indicates a field was removed
    });

    // Set methods tests
    test('addToSet adds a member', async () => {
        const addResult = await redisInterface.addToSet(testSetKey, testMember);
        expect(addResult).toBe(1); // 1 indicates a new member was added
    });

    test('getSetMembers retrieves set members', async () => {
        const members = await redisInterface.getSetMembers(testSetKey);
        expect(members).toContain(testMember);
    });

    test('removeFromSet removes a member', async () => {
        const removeResult = await redisInterface.removeFromSet(testSetKey, testMember);
        expect(removeResult).toBe(1); // 1 indicates a member was removed
    });

});
