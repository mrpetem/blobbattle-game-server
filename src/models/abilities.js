class Abilities {



    constructor() {

        this.abilities = {
            laserBeam: { code: 'la', selectionProbability: 0.26, type: 'attack', baseDmg: 30, charges: 1, maxCharges: 1 },
            bomb: { code: 'bo', selectionProbability: 0.26, type: 'attack', baseDmg: 40, charges: 1, maxCharges: 1 },
            airdrop: { code: 'ai', selectionProbability: 0.26, type: 'attack', baseDmg: 0, charges: 1, maxCharges: 1 },
            sniper: { code: 'sn', selectionProbability: 0.26, type: 'attack', baseDmg: 50, charges: 1, maxCharges: 1 },
            nuke: { code: 'nu', selectionProbability: 0.04, type: 'attack', baseDmg: 40, charges: 1, maxCharges: 1 },
            handbag: { code: 'ha', selectionProbability: 0.2, type: 'buff', baseDmg: 15, charges: 2, maxCharges: 3 },
            tripleJump: { code: 'tr', selectionProbability: 0.2, type: 'buff', baseDmg: 0, charges: 2, maxCharges: 2 },
            rage: { code: 'ra', selectionProbability: 0.2, type: 'buff', baseDmg: 0, dmgMultiplyer: 2, charges: 2, maxCharges: 2 },
            teleport: { code: 'te',selectionProbability: 0.2, type: 'buff', baseDmg: 0, charges: 1, maxCharges: 1 },
            invisibility: { code: 'in', selectionProbability: 0.2, type: 'buff', baseDmg: 0, charges: 2, maxCharges: 2 },
            debuff: { code: 'de', selectionProbability: 0.3, type: 'debuff', baseDmg: 0, charges: 1, maxCharges: 1 },
            mine: { code: 'mi', selectionProbability: 0.4, type: 'debuff', baseDmg: 20, charges: 1, maxCharges: 1 },
            freeze: { code: 'fr', selectionProbability: 0.3, type: 'debuff', baseDmg: 0, charges: 1, maxCharges: 1 },
            healthRegen: { code: 'he', selectionProbability: 0.45, type: 'support', minHealthRestored: 30, maxHealthRestored: 50, baseDmg: 0, charges: 1, maxCharges: 1 },
            lifeRegen: { code: 'li', selectionProbability: 0.1, type: 'support', minHealthRestored: 100, maxHealthRestored: 100, baseDmg: 0, charges: 1, maxCharges: 1 },
            shield: { code: 'sh', selectionProbability: 0.45, type: 'support', baseDmg: 0, charges: 1, maxCharges: 1 },
            blank: { code: '', selectionProbability: 1, type: 'blank' },
        };

        this.abilityTypes = {
            attack: {selectionProbability: 0.19},
            buff: {selectionProbability: 0.19},
            debuff: {selectionProbability: 0.19},
            support: {selectionProbability: 0.19},
            blank: {selectionProbability: 0.24},
        };
    }



    selectRandomAbilityType() {
        let totalProbability = Object.values(this.abilityTypes).reduce((sum, type) => sum + type.selectionProbability, 0);
        let randomNum = Math.random() * totalProbability;

        for (const [type, data] of Object.entries(this.abilityTypes)) {
            randomNum -= data.selectionProbability;
            if (randomNum <= 0) {
                return type;
            }
        }
    }



    selectRandomAbility() {
        // Step 1: Select Ability Type
        const selectedType = this.selectRandomAbilityType();
        const filteredAbilities = Object.entries(this.abilities).filter(([name, ability]) => ability.type === selectedType);
    
        // Step 2: Select Ability within the Chosen Type
        let totalProbability = filteredAbilities.reduce((sum, [name, ability]) => sum + ability.selectionProbability, 0);
        let randomNum = Math.random() * totalProbability;
    
        for (let i = 0; i < filteredAbilities.length; i++) {
            const [name, ability] = filteredAbilities[i];
    
            // Adjust the last ability's probability to cover any remaining probability space
            if (i === filteredAbilities.length - 1) {
                return ability.code;
            }
    
            randomNum -= ability.selectionProbability;
            if (randomNum <= 0) {
                return ability.code;
            }
        }
    }

}


module.exports = new Abilities();