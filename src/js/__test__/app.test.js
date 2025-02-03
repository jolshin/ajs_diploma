import { calcTileType  } from "../utils";
import Character from "../Character";

import Bowman from "../characters/bowman.js";
import Swordsman from "../characters/swordsman";
import Magician from "../characters/magician";
import Vampire from "../characters/vampire";
import Undead from "../characters/undead";
import Daemon from "../characters/daemon";

import GameStateService from "../GameStateService.js";


import { attackRange, moveRange, actionDistance } from "../utils.js"
import { generateTeam } from "../generators.js"

describe('calcTileTYpe function tests', () => {

    
    const cases = [
        [0, 9, 'top-left'],
        [13, 14, 'top-right'],
        [1, 3, 'top'],
        [12, 4, 'bottom-left'],
        [63, 8, 'bottom-right'],
        [44, 7, 'bottom'],
        [14, 5, 'right'],
        [10, 10, 'left'],
        [15, 11, 'center'],
    ]

    test.each(cases)(
        'given %i as index and %i as boardsize, returns %s',
        (index, boardSize, expected) => {
            const recieved = calcTileType(index, boardSize);
            expect(recieved).toEqual(expected);
        }
    )
});


describe('calcTileTYpe throw new Error test', () => {
test('test. An error test for the bord size less then 3 squares', () => {
    expect(() => calcTileType(0.1,2.3)).toThrow("Board size couldn't be less then 3 squares")
        }
    )
});

describe('Character, children classes and generators tests', () => {
    test('test. New.target throws error if the name is Character', () => {
        expect(() => new Character).toThrow("The Character class is a base class and can't be called with new")
            }
        )

    test("test. New.target doesn't throw an error if a Characters children object is created", () => {
        const expected = {"attack": 25, "defence": 25, "health": 50, "level": 1, "type": "bowman"}
        const recieved = new Bowman(1);
        expect(recieved).toEqual(expected);
            }
        )

            
    const casesForCharacters = [
        ['Bowman', new Bowman(1), {"attack": 25, "defence": 25, "health": 50, "level": 1, "type": "bowman"}],
        ['Swordsman', new Swordsman(2), {"attack": 40, "defence": 10, "health": 50, "level": 2, "type": "swordsman"}],
        ['Magician', new Magician(3), {"attack": 20, "defence": 40, "health": 50, "level": 3, "type": "magician"}],
        ['Vampire', new Vampire(4), {"attack": 25, "defence": 25, "health": 50, "level": 4, "type": "vampire"}],
        ['Undead', new Undead(1), {"attack": 40, "defence": 10, "health": 50, "level": 1, "type": "undead"}],
        ['Daemon', new Daemon(2), {"attack": 10, "defence": 10, "health": 50, "level": 2, "type": "daemon"}]
    ]

    test.each(casesForCharacters)(
        `test. Create %s object`,
        (_, className, expected) => {
            const recieved = className;
            expect(recieved).toEqual(expected);
        }
    )

    test("test. New.target doesn't throw an error if a Characters children object is created", () => {
        const expected = {"attack": 25, "defence": 25, "health": 50, "level": 1, "type": "bowman"}
        const recieved = new Bowman(1);
        expect(recieved).toEqual(expected);
            }
        )

            
    const casesForGenerator = [
        ['Team 1', {allowedTypes : [Bowman, Swordsman, Magician], maxLevel : 4, characterCount : 4, group : 'left'}],
        ['Team 2', {allowedTypes : [Bowman, Swordsman, Magician], maxLevel : 3, characterCount : 3, group : 'left'}],
        ['Team 3', {allowedTypes : [Bowman, Swordsman, Magician], maxLevel : 10, characterCount : 2, group : 'left'}],
        ['Team 4', {allowedTypes : [Bowman, Swordsman, Magician], maxLevel : 4, characterCount : 4, group : 'left'}],
        ['Team 5', {allowedTypes : [Vampire, Undead, Daemon], maxLevel : 3, characterCount : 3, group : 'right'}],
        ['Team 6', {allowedTypes : [Vampire, Undead, Daemon], maxLevel : 10, characterCount : 2, group : 'right'}],
        ['Team 7', {allowedTypes : [Vampire, Undead, Daemon], maxLevel : 10, characterCount : 2, group : 'right'}],
        ['Team 8', {allowedTypes : [Vampire, Undead, Daemon], maxLevel : 4, characterCount : 4, group : 'right'}],
    ]

    test.each(casesForGenerator)(
        `test team random generator. Generated %s is random`,
        (_, params) => {
            const recieved = generateTeam(params.allowedTypes, params.maxLevel, params.characterCount, params.group);
            const expected = generateTeam(params.allowedTypes, params.maxLevel, params.characterCount, params.group);
            expect(recieved).not.toEqual(expected);
        }
    )

    test.each(casesForGenerator)(
        `test team random generator. For %s maxLevel is not exceeded`,
        (_, params) => {
            const genTeam = generateTeam(params.allowedTypes, params.maxLevel, params.characterCount, params.group);
            let levels = []; 
            (() => { for(let item of genTeam) {levels.push(item.level)} });
            const recieved = Math.max(...levels);
            const expected = params.maxLevel;
            expect(recieved).toBeLessThanOrEqual(expected);
        }
    )
    
    test.each(casesForGenerator)(
        `test team random generator. For %s characterCount is equal to the input parameter`,
        (_, params) => {
            const genTeam = generateTeam(params.allowedTypes, params.maxLevel, params.characterCount, params.group);
            const recieved = genTeam.length;
            const expected = params.characterCount;
            expect(recieved).toBe(expected);
        }
    )
    });
    
describe('Characters attack and move tests', () => {

    const casesForMove = [
        ['Bowman', {action : 'move', character : 'bowman', index : 0, boardSize : 8}, [9, 18, 8, 16, 1, 2, 0]],
        ['Swordsman', {action : 'move', character : 'swordsman', index : 40, boardSize : 8}, [
                32, 24, 16,  8, 33, 26, 19,
                12, 49, 58, 48, 56, 41, 42,
                43, 44, 40
            ]
            ],
        ['Magician', {action : 'move', character : 'magician', index : 22, boardSize : 8}, [13, 14, 15, 31, 30, 29, 21, 23, 22]],
        ['Vampire', {action : 'move', character : 'vampire', index : 45, boardSize : 8}, [
                36, 27, 37, 29, 38, 31, 54,
                63, 53, 61, 52, 59, 44, 43,
                46, 47, 45
            ]
            ],
        ['Undead', {action : 'move', character : 'undead', index : 2, boardSize : 8}, [
                11, 20, 29, 38, 10, 18, 26,
                34,  9, 16,  1,  0,  3,  4,
                 5,  6,  2
            ]
            ],
        ['Daemon', {action : 'move', character : 'daemon', index : 34, boardSize : 8}, [25, 26, 27, 43, 42, 41, 33, 35, 34]],
    ]

    const casesForAttack= [
        ['Bowman', {action : 'attack', character : 'bowman', index : 4, boardSize : 8}, [
                -12, -11, -10, -4, -3, -2,   4,   5,   6,
                 12,  13,  14, 20, 21, 22, -12, -13, -14,
                 -4,  -5,  -6,  4,  3,  2,  12,  11,  10,
                 20,  19,  18
            ]],
        ['Swordsman', {action : 'attack', character : 'swordsman', index : 8**2-1, boardSize : 8}, [71, 72, 55, 54, 63, 62, 71, 70]],
        ['Magician', {action : 'attack', character : 'magician', index : 32, boardSize : 8}, [
                0,  1,  2,  3,  4,  8,  9, 10, 11, 12, 16,
               17, 18, 19, 20, 24, 25, 26, 27, 28, 32, 33,
               34, 35, 36, 40, 41, 42, 43, 44, 48, 49, 50,
               51, 52, 56, 57, 58, 59, 60, 64, 65, 66, 67,
               68
            ]],
        ['Vampire', {action : 'attack', character : 'vampire', index : 5, boardSize : 8}, [
                -11, -10, -9, -3, -2, -1,   5,   6,   7,
                 13,  14, 15, 21, 22, 23, -11, -12, -13,
                 -3,  -4, -5,  5,  4,  3,  13,  12,  11,
                 21,  20, 19
            ]],
        ['Undead', {action : 'attack', character : 'undead', index : 55, boardSize : 8}, [47, 46, 55, 54, 63, 62]],
        ['Daemon', {action : 'attack', character : 'daemon', index : 8, boardSize : 8}, [
                -24, -23, -22, -21, -20, -16, -15, -14, -13, -12,  -8,
                 -7,  -6,  -5,  -4,   0,   1,   2,   3,   4,   8,   9,
                 10,  11,  12,  16,  17,  18,  19,  20,  24,  25,  26,
                 27,  28,  32,  33,  34,  35,  36,  40,  41,  42,  43,
                 44, -24, -25, -26, -27, -28, -16, -17, -18, -19, -20,
                 -8,  -9, -10, -11, -12
              ]
            ],
    ]
    
    
     test.each(casesForMove)(
        `test move range for a %s object`,
        (_, params, expected) => {
            const recieved = moveRange(params.index, params.boardSize, actionDistance(params.action, params.character));
                
            expect(recieved).toEqual(expected);
        }
    ) 
        
    test.each(casesForAttack)(
        `test attack range for a %s object`,
        (_, params, expected) => {
            const recieved = attackRange(params.index, params.boardSize, actionDistance(params.action, params.character));
                
            expect(recieved).toEqual(expected);
        }
    )
});


describe('GameStateService save and load methods tests', () => {
    const stateService = new GameStateService(localStorage);
    
    test('test. Save and load test', () => {
        stateService.save('test')
        const expected = stateService.load()
        const recieved = 'test';
        expect(recieved).toBe(expected);
        }
    )    
    test('test. Load catch(e) test', () => {
        stateService.save(GameStateService)
        expect(() => stateService.load()).toThrow('Invalid state')
            }
        )

});