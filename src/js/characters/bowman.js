import Character from "../Character.js";

export default class Bowman extends Character {
    constructor(level) {
        super(level, 'bowman');
        this.level = level;
        this.attack = 25; 
        this.defence = 25;
    }
}
