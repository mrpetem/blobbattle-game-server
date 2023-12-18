const { v4: uuidv4, validate: validateUuid } = require('uuid');
const fs = require('fs');
const path = require('path');

class Utils {
    /**
     * Reads a file and returns its content split by lines.
     * @param {string} filePath - The path to the file.
     * @returns {string[]} An array of lines from the file.
     */
    static readFileLines(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return data.split(/\r?\n/);
        } catch (err) {
            console.error('Error reading file:', err);
            return [];
        }
    }

    /**
     * Generates a UUID v4.
     * @returns {string} A UUID string.
     */
    static generateUUID() {
        return uuidv4();
    }

    /**
     * Validates a UUID v4.
     * @returns {string} A UUID string.
     */
    static validateUUID(uuid) {
        return validateUuid(uuid);
    }

    static cleanUsername(username) {
        try {
            const bannedWords = Utils.readFileLines(path.join(__dirname, '../utils/banned-words.txt'));

            let cleanUsername = username;

            bannedWords.forEach(bannedWord => {
				const trimmedWord = bannedWord.trim();
				if (trimmedWord.length >= 4) {
					// Create a dynamic regular expression for each banned word
					const wordRegex = new RegExp(`(${trimmedWord})`, 'gi');
	
					// Replace occurrences of the banned word
					cleanUsername = cleanUsername.replace(wordRegex, match => {
						return '*'.repeat(match.length);
					});
				}
			});

            // Remove non-alphanumeric characters
            cleanUsername = cleanUsername.replace(/[^a-zA-Z0-9*_ ]/g, "");

            return cleanUsername.substring(0, 24);
        } catch (err) {
            console.error('Error cleaning the username:', err);
            return username; // Return original username in case of error
        }
    }

}

module.exports = Utils;
