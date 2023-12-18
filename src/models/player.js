const path = require('path');

// Utils
const util = require('@utils/utils.js');

class Player {

    constructor(socketId, username) {
        this.id = util.generateUUID();
        this.publicId = util.generateUUID();
        this.socketId = socketId;
        this.username = this.cleanUsername(username);
        this.ready = false;
        this.createdAt = new Date().toISOString();
        this.rank = this.convertPointsToRank(0);
        this.points = 0;
        this.totalGames = 0;
        this.health = 100;
        this.passiveAbilities = [];
        this.currentAbility = '';
    }
    
    cleanUsername(username) {
        return util.cleanUsername(username);
    }

    updatePlayerPoints(winPosition) {
        switch (winPosition) {
            case 1:
                this.points += 2;
                break;
            case 2:
                this.points += 1;
                break;
            case 3:
                break;
            case 4:
                if (this.points > 5 && this.points < 11) {
                    this.points -= 1;
                } else if (this.points < 31) {
                    this.points -= 2;
                } else if (this.points > 30) {
                    this.points -= 3;
                }
                break;
        }

        this.rank = this.convertPointsToRank(this.points);
    }

    convertPointsToRank(points) {
        if (points < 5) {
            return 'Rookie';
        } else if (points < 10) {
            return 'Initiate';
        } else if (points < 15) {
            return 'Private';
        } else if (points < 20) {
            return 'Corporal';
        } else if (points < 25) {
            return 'Lieutenant';
        } else if (points < 30) {
            return 'Sergeant';
        } else if (points < 35) {
            return 'Captain';
        } else if (points < 40) {
            return 'General';
        } else {
            return 'President';
        }
    }
}

module.exports = Player;
