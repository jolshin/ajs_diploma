
import GameState from "./GameState.js";

import { bot, charactersMaker, levelUp, cellChecker, attackRange, moveRange, gameStateToNull, actionDistance, turnToggle, gameOver, newGame } from "./utils.js"


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = gamePlay.boardSize;
  }

  init() {
    //storing games parameters in the GameState
    GameState.map = 'prairie';
    GameState.turn = 'left';
    GameState.bot = 'off';
    GameState.boardSize = this.boardSize;
    GameState.gamePlay = this.gamePlay;
    GameState.stateService = this.stateService;


    this.gamePlay.drawUi(GameState.map);

    //creating characters
    charactersMaker(this.boardSize)
    //charactersMaker creates characters with different levels (maxLevel), but it doesn't recalculates health and attack
    //levelUp is for the recalculation and setting an apropriate values of health and attack 
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
    //check if the game is going on and it's players turn
    if (GameState.turn === 'left' & !GameState.over) {

      //check if there is a character in the cell
      if (cellChecker(index)) {
        //index of characters object stored in GameState.positionedCharacter array
        const selectedCharacter = cellChecker(index)[0];
        //object of the GameState.positionedCharacter 
        const characterObj = cellChecker(index)[1];
        
        //if the character not dead neither dead
        if (characterObj.status != ('went' || 'dead') ){

          //if the character is in players team
          if (characterObj.character.team === GameState.turn) {

            //if the player previously selected his charcter - delete highlight
            if (GameState.selectedCell != null) {
              this.deselectCell(GameState.selectedCell)
            }

            //set highlight to the currently choosen character
            this.selectCell(index)

            //store parameters of the players turn
            GameState.selectedCharacter = selectedCharacter;
            GameState.selectedCell = index;

            //calculates moves' available positions 
            GameState.attackRange = attackRange(index, this.boardSize, actionDistance('attack', characterObj.character.type))
            GameState.moveRange = moveRange(index, this.boardSize, actionDistance('move', characterObj.character.type));

            //else if the selected cell contains an enemy
          } else if (GameState.selectedCell != null) {
            //if the enemy in the range of attack
            if (GameState.attackRange.includes(index)) {

              const attack = GameState.positionedCharacter[GameState.selectedCharacter].character.attack;
              const health = GameState.positionedCharacter[cellChecker(index)[0]].character.health;
              const defence = GameState.positionedCharacter[cellChecker(index)[0]].character.defence;

              const damage = Math.max(attack - defence, attack * 0.1);

              //defines whether damage is dealt or the enemy dies
              if (health > damage){   
                GameState.positionedCharacter[cellChecker(index)[0]].character.health = health - damage;
              } else {
                GameState.positionedCharacter[cellChecker(index)[0]].status = 'dead';
              }

              //stores that move done after attack
              GameState.positionedCharacter[GameState.selectedCharacter].status = 'went';

              //delete highlight of the character and enemy
              this.deselectCell(GameState.selectedCell);
              this.deselectCell(index);

              //set to null stored parameters of the move done
              gameStateToNull();
                  
              this.showDamage(index, damage).then(() => {
                this.redrawPositions(GameState.positionedCharacter);
              });

              //toggles turn between sides
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

        //if the player choosen a character
        if (GameState.selectedCell != null){
          //if the cell in the range of the characters move
          if (GameState.moveRange.includes(index)) {

            //change position of the character
            GameState.positionedCharacter[GameState.selectedCharacter].position = index;
            //stores that move done
            GameState.positionedCharacter[GameState.selectedCharacter].status = 'went'
                
            //delete highlights, redraw field 
            this.deselectCell(GameState.selectedCell)
            this.redrawPositions(GameState.positionedCharacter) 
            this.deselectCell(index);

            //set to null stored parameters of the move done
            gameStateToNull();
            //toggles turn between sides
            turnToggle();

          } else {
              //Out of the moves range
          }
        } else {
          //Choose a character
        }
      } 

      //check if the game is over and restart if it is
      gameOver()

      //if the turn of Bot and Bot is set to off mode
      if (GameState.turn === 'right' & GameState.bot === 'off') {
        //turn Bot on to prevent players actions during Bots turn
        GameState.bot = 'on'
        setTimeout(bot, 1000);
      } 

    } else {
    //It is not your turn
    }  
  }

  onCellEnter(index) {
    //check if there is a character in the cell
    //show toolTip
    if (cellChecker(index)){
      const characterObj = cellChecker(index)[1];
      const character = characterObj.character;
      const message = `\u{1F396}${character.level} \u{2694}${character.attack} \u{1F6E1}${character.defence} \u{2764}${character.health}`;
      this.showCellTooltip(message, index);
      this.setCursor('pointer');
    } 

    //change pointers style according to what is stored in the cell
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
    //hide tooltip and delete highlightes
    this.hideCellTooltip(index);
    if (index != GameState.selectedCell){
      this.deselectCell(index);
      this.setCursor('default');
    }
  }
  
  onNewGameClick() {
    //if the turn is not Bots
    if (GameState.bot === 'off') {
      newGame('left', true)
    }
  }

  onSaveGameClick() {
    //if the turn is not Bots
    if (GameState.bot === 'off') {
      //prepare object to save as a state of the game
      const state = {
        positionedCharacter : GameState.positionedCharacter,
        map : GameState.map
      }
      GameState.stateService.save(state)
    }
  }

  onLoadGameClick() {
    //if the turn is not Bots
    if (GameState.bot === 'off') {
      let state = GameState.stateService.load()
      //set state to the GameState psrameters
      GameState.positionedCharacter = state.positionedCharacter;
      GameState.map = state.map;
      //redraw according to the loaded state
      GameState.gamePlay.drawUi(GameState.map);
      GameState.gamePlay.redrawPositions(GameState.positionedCharacter);
    }
  }
}

