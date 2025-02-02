import Character from "../Character.js";

export default class Magician extends Character {
    constructor(level) {
        super(level, 'magician');
        this.level = level;
        this.attack = 20; 
        this.defence = 40;
    }
}
