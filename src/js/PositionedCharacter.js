import Character from './Character';

export default class PositionedCharacter {
  constructor(character, position, status = 'no') {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    character.position = position;
    
    this.character = character;
    this.position = position;
    this.status = status;
  }
}
