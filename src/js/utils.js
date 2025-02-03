import Bowman from "./characters/bowman.js";
import Swordsman from "./characters/swordsman";
import Magician from "./characters/magician";
import Vampire from "./characters/vampire";
import Undead from "./characters/undead";
import Daemon from "./characters/daemon";

import PositionedCharacter from "./PositionedCharacter";
import Team from "./Team";

import GameState from "./GameState.js";

import { generateTeam } from "./generators";

//returns an object with characters and distances of move and attck
export function actionDistance(action, character) {
  const actions = {
    move : { 
      swordsman : 4,
      undead : 4,
      bowman : 2,
      vampire : 2,
      magician : 1, 
      daemon : 1
     },
    attack : {
      swordsman : 1,
      undead : 1,
      bowman : 2,
      vampire : 2,
      magician : 4,
      daemon : 4

    }
  }

  return actions[action][character]
}


//returns an object of teams (left or right side) with arrays of available start positions (limits) 
// where characters of teams could be placed
export function teams(boardSize = 8) {
  return { 
    left : {
      positionLimits : startPositionLimits('left', boardSize),
      team : [Bowman, Swordsman, Magician]
    },
    right : {
      positionLimits : startPositionLimits('right', boardSize),
      team : [Vampire, Undead, Daemon]
    }
  }
}

//it was here 
export function calcTileType(index, boardSize) {

  if (boardSize < 3 ) {
    throw new Error("Board size couldn't be less then 3 squares")
  }
  index = index+1;
  index = Number.parseInt(index);
  boardSize = Number.parseInt(boardSize);
  let leftArr = [];
  let rightArr = [];
  let centerArr = [];
  const boardSq = boardSize**2;

  for (let i = 1; i <= boardSize-2; i++)  {
    leftArr.push(boardSize*i+1);
    rightArr.push(boardSize*(i+1));
    for (let j = 2; j <= boardSize-1; j++) {
      centerArr.push(boardSize*i+j);
    }
  }

  if (index === 1) {
    return 'top-left';
  } else if (index === boardSize) {
    return 'top-right';
  } else if (index === boardSq) {
    return 'bottom-right';
  } else if (index === boardSq-boardSize+1) {
    return 'bottom-left'
  } else if (index > 1 && index < boardSize) {
    return 'top'
  } else if (index > boardSq-boardSize+1 && index < boardSq) {
    return 'bottom'
  } else if (leftArr.includes(index)) {
    return 'left'
  } else if (rightArr.includes(index)) {
    return 'right'
  } else if (centerArr.includes(index)) {
    return 'center'
  }

}

//it was here
export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

//returns random number in the range from 0 to the 'top' parameter 
export function randomNum(top) {
  return Math.floor(Math.random() * (top))
}

//returns limits of available positions for each team (side), is used in teams() function
export function startPositionLimits(align, boardSize) {
  let acceptablePositions = [];
  
  if (align === 'left') {
      for (let i = 0; i < boardSize; i++) {
          acceptablePositions.push((i * boardSize), (i * boardSize + 1 ))
      }
  } else {
      for (let i = 0; i < boardSize; i++) {
          acceptablePositions.push((i * boardSize + boardSize - 2), (i * boardSize + boardSize - 1))
      }
  }
  return acceptablePositions
}

//returns an array of available positions for characters move
export function moveRange(index, boardSize, distance) {
  if (distance > boardSize - 2) {
    throw new Error("Distance can't be equal or only 2 squares less than the board size")
  }
  let availablePositions = [];
  let limits = [];

  for (let i = 0; i <= boardSize**2; i = i + boardSize) {
    limits.push(i-1,i);
  }

  for (let sign of [-1, 1]) {
    for (let j = 1; j > -2;  j--) {
      for (let i = 1; i < (distance + 1); i++) {
        let position = index + sign * (boardSize + j) * i;
        if (limits.includes(index) & limits.includes(position) & j !== 0 ) {
        break;
        }
        if (position >= 0 & position <= boardSize**2-1) {
          availablePositions.push(position);
          if (limits.includes(position) & j !== 0) {
            break;
          } 
        } else {break}
      }
    }         
  }
  
  for (let sign of [-1, 1]) {
    for (let i = 1; i < (distance + 1); i++) {
      let position = index + i * sign;

      if (limits.includes(index) & limits.includes(position)) {break}
      if (position >= 0 & position <= boardSize**2-1) {
        availablePositions.push(position);
        if (limits.includes(position)) {break}
      } else {break}
    }
  }
  availablePositions.push(index);

  return availablePositions;
}

//returns an array of available positions for characters attack
export function attackRange(index, boardSize, distance) {
  if (distance > boardSize - 2) {
    throw new Error("Distance can't be equal or only 2 squares less than the board size")
  }
  let availablePositions = [];
  let limits = [];

  for (let i = 0; i <= boardSize**2; i = i + boardSize) {
    limits.push(i-1,i);
  }

  for (let j = -distance; j < distance + 1; j++) {
    for (let i = 0; i <= distance; i++) {
      let position = index + j * boardSize + i;

      availablePositions.push(position);


      if (limits.includes(position) & !limits.includes(index) ) {
        break;
      } else if (limits.includes(position) & limits.includes(availablePositions[availablePositions.length-2])){
        availablePositions.pop();
        availablePositions.pop();
        break;
      }
    }      
  }
  
  for (let j = -distance; j < distance + 1; j++) {
    for (let i = 0; i >= -distance; i--) {
      let position = index + j * boardSize + i;

      availablePositions.push(position);

      if (limits.includes(position) & !limits.includes(index) ) {
        break;
      } else if (limits.includes(position) & limits.includes(availablePositions[availablePositions.length-2])){
        availablePositions.pop();
        availablePositions.pop();
        break;
      }
    }   
  }
  return availablePositions;
}

//prepares arguments for the new PositionedCharacter() class constructor, then creates an objects and stored it all in the GameState
export function charactersMaker(boardSize) {
  let positions = [];
  let randomCounter = [];

  for (let group of ['left', 'right']) {

    const allowedTypes = new Team(teams(boardSize)[group].team);
    const maxLevel = 3;
    const characterCount = 4;
    const team = generateTeam(allowedTypes.characters, maxLevel, characterCount, group);

    if (characterCount > boardSize * 2) {
      throw new Error(`Number of characters can't be more then ${boardSize * 2} characters`);
    }

    team.forEach(function (member) {
      let random = randomNum(boardSize**2);
      while(randomCounter.includes(random) || !teams(boardSize)[group].positionLimits.includes(random)) {
        random = randomNum(boardSize**2);
      };

      randomCounter.push(random)
      
      let positionedCharacter = new PositionedCharacter(member, random);
      positions.push(positionedCharacter)
    });
  }
  GameState.positionedCharacter = positions
}

//checks if there anything in the cell when the cell is clicked or entered
// retruns object (character) if this object in this particular cell
export function cellChecker(index) {
  for (let i = 0; i < GameState.positionedCharacter.length; i++){
    if (index === GameState.positionedCharacter[i].position & GameState.positionedCharacter[i].status != 'dead') {
      return [i, GameState.positionedCharacter[i]]
    }
  }  
}

//sets some of parameter of the GameState to null, is used when turn is over
export function gameStateToNull() {
  GameState.selectedCharacter = null;
  GameState.selectedCell = null;
  GameState.attackRange = null;
  GameState.moveRange = null;
}

//makes opponents move, plays for the right side team
export function bot() {
  const enemies = [];
  const characters = [];
  
  for (let item of GameState.positionedCharacter){
    if (item.character.team === 'left' & item.status != 'dead') {
      enemies.push(item)
    } else if(item.character.team === 'right' & item.status != 'dead') {
      characters.push(item)
    }
  }

  for (let characterObj of characters) {
    const _attackRange = attackRange(characterObj.position, GameState.boardSize, actionDistance('attack', characterObj.character.type));
    const _moveRange = moveRange(characterObj.position, GameState.boardSize, actionDistance('attack', characterObj.character.type));
    const activeCharacter = GameState.positionedCharacter.findIndex(p => p.position === characterObj.position)
      
    for (let enemy of enemies) {
      if (_attackRange.includes(enemy.position) & enemy.status != 'dead') {

        const attack = characterObj.character.attack;
        const health = GameState.positionedCharacter[cellChecker(enemy.position)[0]].character.health;
        const defence = GameState.positionedCharacter[cellChecker(enemy.position)[0]].character.defence;
        const damage = Math.max(attack - defence, attack * 0.1)
 
        if (health > damage){   
            GameState.positionedCharacter[cellChecker(enemy.position)[0]].character.health = health - damage;
        } else {
            GameState.positionedCharacter[cellChecker(enemy.position)[0]].status = 'dead';
        }
        
        GameState.positionedCharacter[activeCharacter].status = 'went';
        break;

      } 
    }
    if (GameState.positionedCharacter[activeCharacter].status != 'went'){

      let position = (() => { return _moveRange[[Math.floor((Math.random()*_moveRange.length))]]})()
      while (cellChecker(position)) {
        position = (() => { return _moveRange[[Math.floor((Math.random()*_moveRange.length))]]})()
      }

      GameState.positionedCharacter[activeCharacter].position = position
      GameState.positionedCharacter[activeCharacter].status = 'went';       
    }
    GameState.gamePlay.redrawPositions(GameState.positionedCharacter);
    turnToggle();
    GameState.bot = 'off'
  }

}

//returns array of available maps
export function maps() {
  return ['prairie', 'desert', 'arctic', 'mountain']
}

//levelUp - as it is described in the task
export function levelUp() {
  for (let characterObj of GameState.positionedCharacter) {
    characterObj.status = 'no';
      if (characterObj.character.level > 1 & characterObj.character.team === 'left') {
        for (let i = 1; i < characterObj.character.level; i++){
        let attack = characterObj.character.attack;
        let health = characterObj.character.health;

        characterObj.character.attack = Math.max(attack, attack * (80 + health) / 100);
        characterObj.character.health = health >= 20 ? 100 : health + 80;
    }} else {
      characterObj.character.health = 50;
    }}};

//heals characters if player loses and new game starts
export function heal() {
  for (let characterObj of GameState.positionedCharacter) {
    characterObj.status = 'no';
    if (characterObj.character.level > 1) {
      characterObj.character.health = 100;
    } else {
      characterObj.character.health = 50;
    }}};

//makes random positions for each character, limited by the start positions 
export function randomPositionedCharacter() {

  let randomCounter = [];
  for (let characterObj of GameState.positionedCharacter) {
    let random = randomNum(GameState.boardSize**2);
    while(randomCounter.includes(random) || !teams(GameState.boardSize)[characterObj.character.team].positionLimits.includes(random)) {
      random = randomNum(GameState.boardSize**2);
    };
    randomCounter.push(random);
    characterObj.position = random;

  }
}

//initiates new game (except first game which is initiated by the init() method of the GamePlay)
export function newGame(winner, restart = false) {

  if (winner === 'left') {

    const mapArray = maps();
    let nextMap = 0;

    if (!restart) {
      nextMap = mapArray.indexOf(GameState.map) + 1;
    } 

    if (nextMap !== mapArray.length) {

      if (!restart) {
        for (let characterObj of GameState.positionedCharacter) {
          if (characterObj.status != 'dead') {
            characterObj.character.level = characterObj.character.level + 1;
          } else {
            characterObj.status = 'no';
          }
        }
        randomPositionedCharacter();
      } else {     
        charactersMaker(GameState.gamePlay.boardSize)
      }
      levelUp();

      GameState.map = mapArray[nextMap];
      GameState.turn = 'left';
      GameState.bot = 'off';
      GameState.gamePlay.drawUi(GameState.map);
      GameState.gamePlay.redrawPositions(GameState.positionedCharacter);

    } else {
      alert('GAME OVER')
      GameState.over = true;
      GameState.bot = 'off';
    }

  } else {

    for (let characterObj of GameState.positionedCharacter) {
      characterObj.status = 'no';
    }

    randomPositionedCharacter();
    heal();

    GameState.turn = 'left';
    GameState.bot = 'off';
    GameState.gamePlay.drawUi(GameState.map);
    GameState.gamePlay.redrawPositions(GameState.positionedCharacter);
  }

}

//checks if there are characters at any of sides and calls newGame()
export function gameOver() {
  const enemies = [];
  const characters = [];
  
  for (let item of GameState.positionedCharacter){
    if (item.character.team === 'left' & item.status != 'dead') {
      characters.push(item)
    } else if(item.character.team === 'right' & item.status != 'dead') {
      enemies.push(item)
    }
  }

  if (enemies.length === 0) {
    newGame('left')
  } 
  if (characters.length === 0) {
    newGame('right')
  }
}

//toggles turn between sides by counting characters which done those move
export function turnToggle() {
  let turnCounter = 0;
  let teamCharacters = 0;
  for (let item of GameState.positionedCharacter) {
    if (item.character.team === GameState.turn & item.status != 'dead') {
      teamCharacters++
      
      if (item.status === 'went'){
        turnCounter++
      }
    }
  }

  if (turnCounter === teamCharacters) {
    GameState.turn = GameState.turn === 'left' ? 'right' : 'left'
    
    for (let item of GameState.positionedCharacter) {
      if (item.status === 'went') {
        item.status = 'no'
      }
    }
  }

}
