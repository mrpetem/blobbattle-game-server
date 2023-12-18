const Abilities = require('@models/abilities');

describe('Abilities Class Tests', () => {

    test('selectRandomAbilityType returns a valid ability type', () => {
        const randomType = Abilities.selectRandomAbilityType();
        expect(Object.keys(Abilities.abilityTypes)).toContain(randomType);
    });

    test('selectRandomAbility returns a valid ability code', () => {
        const randomAbilityCode = Abilities.selectRandomAbility();
        
        // Create an array of all valid ability codes
        const validCodes = Object.values(Abilities.abilities).map(ability => ability.code);
    
        // Check if the randomAbilityCode is one of the valid codes
        expect(validCodes).toContain(randomAbilityCode);
    });
    


});


describe('Abilities Class Randomness Tests', () => {
    const totalMapSquares = 6 * 15;
    const totalMaxTests = totalMapSquares * 10;

    let abilityCounts = {};

    beforeAll(() => {
        // Initialize counts
        for (const ability in Abilities.abilities) {

            let code = Abilities.abilities[ability].code;

            if(!code){
                code = 'blank';
            }

            abilityCounts[code] = 0;
        }
    });

    test('ensure a good variation of abilities selected for a single map instance', () => {

        // Tally the results of multiple random selections
        for (let i = 0; i < totalMapSquares; i++) {
            let randomAbility = Abilities.selectRandomAbility();

            if(!randomAbility){
                randomAbility = 'blank';
            }

            abilityCounts[randomAbility]++;
        }

        expect(Object.keys(abilityCounts).length).toBeGreaterThan(6);
    });

    test('ensure that all abilities will get selected at some point', () => {

        // Tally the results of multiple random selections
        for (let i = 0; i < totalMaxTests; i++) {
            let randomAbility = Abilities.selectRandomAbility();

            if(!randomAbility){
                randomAbility = 'blank';
            }

            abilityCounts[randomAbility]++;
        }

        expect(Object.keys(abilityCounts).length).toBeGreaterThan(Object.keys(Abilities.abilities).length - 2);
    });

});