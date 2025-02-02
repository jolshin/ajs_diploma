
import GameState from "./GameState.js";

import { bot, charactersMaker, levelUp, cellChecker, attackRange, moveRange, gameStateToNull, actionDistance, turnToggle, gameOver, newGame } from "./utils.js"


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = gamePlay.boardSize;
  }

  init() {
    GameState.map = 'prairie';
    GameState.turn = 'left';
    GameState.bot = 'off';
    GameState.boardSize = this.boardSize;
    GameState.gamePlay = this.gamePlay;
    GameState.stateService = this.stateService;

    this.gamePlay.drawUi(GameState.map);

    charactersMaker(this.boardSize)
    levelUp();

    this.gamePlay.redrawPositions(GameState.positionedCharacter);

    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addNewGameListener(this.onNewGameClick);
    this.gamePlay.addSaveGameListener(this.onSaveGameClick);
    this.gamePlay.addLoadGameListener(this.onLoadGameClick);
  }

  onCellClick(index) {    
    if (GameState.turn === 'left' & !GameState.over) {

    if (cellChecker(index)) {
      const selectedCharacter = cellChecker(index)[0];
      const characterObj = cellChecker(index)[1];
      
      if (characterObj.status != ('went' || 'dead') ){
        if (characterObj.character.team === GameState.turn) {

          if (GameState.selectedCell != null) {
            this.deselectCell(GameState.selectedCell)
          }

          this.selectCell(index)

          GameState.selectedCharacter = selectedCharacter;
          GameState.selectedCell = index;
          GameState.attackRange = attackRange(index, this.boardSize, actionDistance('attack', characterObj.character.type))
          GameState.moveRange = moveRange(index, this.boardSize, actionDistance('move', characterObj.character.type));
        } else if (GameState.selectedCell != null) {
          if (GameState.attackRange.includes(index)) {

            const attack = GameState.positionedCharacter[GameState.selectedCharacter].character.attack;
            const health = GameState.positionedCharacter[cellChecker(index)[0]].character.health;
            const defence = GameState.positionedCharacter[cellChecker(index)[0]].character.defence;

            const damage = Math.max(attack - defence, attack * 0.1);

            if (health > damage){   
              GameState.positionedCharacter[cellChecker(index)[0]].character.health = health - damage;
            } else {
              GameState.positionedCharacter[cellChecker(index)[0]].status = 'dead';
            }

              GameState.positionedCharacter[GameState.selectedCharacter].status = 'went';

              this.deselectCell(GameState.selectedCell);
              this.deselectCell(index);

              gameStateToNull();
                
              this.showDamage(index, damage).then(() => {
                this.redrawPositions(GameState.positionedCharacter);
              });

              turnToggle();

            } else {
              //Too far for attack
            }
          } else {
            //Not your turn
            }
        } else {
          //This character did the move
        }
      
    } else {
        //Clicked on an empty field

      if (GameState.selectedCell != null){
        if (GameState.moveRange.includes(index)) {

          GameState.positionedCharacter[GameState.selectedCharacter].position = index;
          GameState.positionedCharacter[GameState.selectedCharacter].status = 'went'
              
          this.deselectCell(GameState.selectedCell)
          this.redrawPositions(GameState.positionedCharacter) 
          this.deselectCell(index);

          gameStateToNull();
          turnToggle();

        } else {
            //Out of the moving range
        }
      } else {
        //Choose a character
      }
    } 

  gameOver()

  if (GameState.turn === 'right' & GameState.bot === 'off') {
    GameState.bot = 'on'
    setTimeout(bot, 1000);
  } 

} else {
  //It is not your turn
}  
}

  onCellEnter(index) {
    
    if (cellChecker(index)){

      const selectedCharacter = cellChecker(index)[0];
      const characterObj = cellChecker(index)[1];

      const character = characterObj.character;
      const message = `\u{1F396}${character.level} \u{2694}${character.attack} \u{1F6E1}${character.defence} \u{2764}${character.health}`;
      this.showCellTooltip(message, index);
      this.setCursor('pointer');
    } 

    if (GameState.selectedCell != null) {
      if (!(cellChecker(index))) {
        if (GameState.moveRange.includes(index)){
          this.selectCell(index, 'green');
          this.setCursor('pointer');
        } else {
         this.setCursor('not-allowed');
        }

      } else if (cellChecker(index)[1].character.team != GameState.turn) {
        if (GameState.attackRange.includes(index)) {
          this.selectCell(index, 'red');
          this.setCursor('crosshair');
        } else {
          this.setCursor('not-allowed');
        }
      }
    }

  }

  onCellLeave(index) {
    this.hideCellTooltip(index);
    if (index != GameState.selectedCell){
      this.deselectCell(index);
      this.setCursor('default');
    }


  }
  
  onNewGameClick() {
    if (GameState.bot === 'off') {
      newGame('left', true)
    }
  }

  onSaveGameClick() {
    if (GameState.bot === 'off') {
      const state = {
        positionedCharacter : GameState.positionedCharacter,
        map : GameState.map
      }
      GameState.stateService.save(state)
    }

  }

  onLoadGameClick() {
    if (GameState.bot === 'off') {

      let state = GameState.stateService.load()
      GameState.positionedCharacter = state.positionedCharacter;
      GameState.map = state.map;
      
      GameState.gamePlay.drawUi(GameState.map);
      GameState.gamePlay.redrawPositions(GameState.positionedCharacter);
    }
  }
}

