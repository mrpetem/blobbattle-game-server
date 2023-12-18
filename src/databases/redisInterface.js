const redis = require('redis');

class RedisInterface {
	


    constructor() {
        
        this.client = redis.createClient({
            url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            database: process.env.REDIS_DB,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 8) {
                        console.log("End reconnecting with built-in error", retries);
                        return new Error('Retry time exhausted');
                    }
                    console.log("Reconnecting attempt:", retries);
                    return Math.min(retries * 100, 3000);
                }
            }
        });
		
		this.client.on("error", async(err) => {
			console.error("redis error occured: ",err);
			await this.client.quit();
		});

    }


    async ensureConnected() {
        if (!this.client.isOpen) {
            try {
                await this.client.connect();
                console.log('Redis client connected');
            } catch (err) {
                console.error('Error connecting to Redis:', err);
                throw err;
            }
        }
    }
	


	async disconnect() {
        try {
            if (this.client) {
                await this.client.quit();
            }
            console.log('Redis client disconnected');
        } catch (error) {
            console.error('Error diconnecting from Redis:', error);
            throw err;
        }
    }



    async setHash(hashKey, field, value) {
        try {
            await this.ensureConnected();
            return await this.client.HSET(hashKey, field, JSON.stringify(value));
        } catch (err) {
            console.error(err);
            throw err;
        }
    }



    async getHashField(hashKey, field) {
        try {
            await this.ensureConnected();
            const value = await this.client.HGET(hashKey, field);
            return JSON.parse(value);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }



    async getHashAllFields(hashKey) {
        try {
            await this.ensureConnected();
            return await this.client.HGETALL(hashKey);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }



    async removeHashField(hashKey, field) {
        try {
            await this.ensureConnected();
            return await this.client.HDEL(hashKey, field);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }



    async addToSet(setKey, member) {
        try {
            await this.ensureConnected();
            return await this.client.SADD(setKey, member);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }



    async getSetMembers(setKey) {
        try {
            await this.ensureConnected();
            return await this.client.SMEMBERS(setKey);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }



    async removeFromSet(setKey, member) {
        try {
            await this.ensureConnected();
            return await this.client.SREM(setKey, member);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
	
	


	async deleteKey(key) {
        try {
            await this.ensureConnected();
            return await this.client.DEL(key);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

// Create a singleton instance
const redisInterface = new RedisInterface();

module.exports = redisInterface;
