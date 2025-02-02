export default class GameState {
  static from(object) {
    this.positionedCharacter = object;
    this.selectedCell = null;
    this.moveRange = null;
    this.attackRange = null;
    this.boardSize;
    return null;
  }
}
