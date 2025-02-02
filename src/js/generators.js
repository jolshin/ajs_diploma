/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */



export function* characterGenerator(allowedTypes, maxLevel, group) {
  while (true) {
    let character = new allowedTypes[Math.floor(Math.random() * (allowedTypes.length))];
    character.level = Math.floor(Math.random() * maxLevel + 1);
    character.team = group;
  
    yield character;
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount, group) {
  let characters = [];

  for (let i = 0; i < characterCount; i++) {
    characters.push(characterGenerator(allowedTypes, maxLevel, group).next().value);
  }
  return characters;
}
