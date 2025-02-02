import { calcTileType  } from "../utils";
import Character from "../Character";
import { cellToolTipChecker } from "../GameController";

import Bowman from "../characters/bowman";
import Swordsman from "../characters/swordsman";
import Magician from "../characters/magician";
import Vampire from "../characters/vampire";
import Undead from "../characters/undead";
import Daemon from "../characters/daemon";


describe('calcTileTYpe function test', () => {

    
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
test('An error test for the bord size less then 3 squares', () => {
    expect(() => calcTileType(0.1,2.3)).toThrow("Board size couldn't be less then 3 squares")
        }
    )
});

describe('Character and children classes tests', () => {
    test('new.target throws error if the name is Character', () => {
        expect(() => new Character).toThrow("The Character class is a base class and can't be called with new")
            }
        )

    test("new.target doesn't throw an error if a Characters children object is created", () => {
        const expected = {"attack": 25, "defence": 25, "health": 50, "level": 1, "type": "bowman"}
        const recieved = new Bowman(1);
        expect(recieved).toEqual(expected);
            }
        )

            
    const cases = [
        ['Bowman', new Bowman(1), {"attack": 25, "defence": 25, "health": 50, "level": 1, "type": "bowman"}],
        ['Swordsman', new Swordsman(2), {"attack": 40, "defence": 10, "health": 50, "level": 2, "type": "swordsman"}],
        ['Magician', new Magician(3), {"attack": 20, "defence": 40, "health": 50, "level": 3, "type": "magician"}],
        ['Vampire', new Vampire(4), {"attack": 25, "defence": 25, "health": 50, "level": 4, "type": "vampire"}],
        ['Undead', new Undead(1), {"attack": 40, "defence": 10, "health": 50, "level": 1, "type": "undead"}],
        ['Daemon', new Daemon(2), {"attack": 10, "defence": 10, "health": 50, "level": 2, "type": "daemon"}]
    ]

    test.each(cases)(
        `create %s object`,
        (_, className, expected) => {
            const recieved = className;
            expect(recieved).toEqual(expected);
        }
    )
    });

