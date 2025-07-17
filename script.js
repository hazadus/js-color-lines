/**
 * Глобальные данные игры
 */
const fieldSize = 9;
const ballColors = ["purple", "red", "blue", "navy", "yellow", "green"];
const newBallsEachTurn = 3;
const minLineLength = 5;
let field = [];
let isGameOver = true;
let selectedBall = null;

// MARK: Логика

/**
 * Очищает игровое поле.
 */
function resetFieldArray() {
  for (let i = 0; i < fieldSize; i++) {
    field[i] = [];
    for (let j = 0; j < fieldSize; j++) {
      field[i][j] = null;
    }
  }
}

/**
 * Запускает новую игру.
 */
function startGame() {
  if (isGameOver) {
    isGameOver = false;
    resetFieldArray();
    addNewBalls();
  }
}

/**
 * Сбрасывает состояние игры.
 */
function resetGame() {
  if (!isGameOver) {
    isGameOver = true;
    resetFieldArray();
  }
}

/**
 * Возвращает массив свободных ячеек игрового поля. Каждый элемент массива
 * представляет собой объект вида `{x: 0, y: 0}`, где (x, y) - координаты свободной ячейки на поле.
 * @returns {Array} Массив свободных ячеек.
 */
function getFreeCells() {
  let freeCells = [];
  for (let y = 0; y < fieldSize; y++) {
    for (let x = 0; x < fieldSize; x++) {
      if (field[x][y] === null) {
        freeCells.push({ x: x, y: y });
      }
    }
  }
  return freeCells;
}

/**
 * Возвращает случайную свободную ячейку игрового поля.
 * Если свободных ячеек нет, возвращает `null`.
 * @returns {Object|null} Случайная свободная ячейка в виде объекта `{x: 0, y: 0}` или `null`, если свободных ячеек нет.
 */
function getRandomFreeCell() {
  let freeCells = getFreeCells();
  let randomFreeCell = null;

  if (freeCells) {
    let randomCellIndex = Math.floor(Math.random() * freeCells.length);
    randomFreeCell = freeCells[randomCellIndex];
  }

  return randomFreeCell;
}

/**
 * Возвращает случайный цвет из массива `ballColors`.
 * @returns {string} Случайный цвет из массива `ballColors`.
 */
function getRandomColor() {
  let randomColorIndex = Math.floor(Math.random() * ballColors.length);
  return ballColors[randomColorIndex];
}

/**
 * Устанавливает выбранный шарик по координатам (x, y).
 */
function selectBall(x, y) {
  selectedBall = { x: x, y: y };
}

/**
 * Добавляет случайный шарик на игровое поле.
 * Если свободные ячейки есть, добавляет шарик и возвращает `true`.
 * Если свободных ячеек нет, возвращает `false`.
 * @returns {boolean} `true`, если шарик был добавлен, иначе `false`.
 */
function addRandomBall() {
  let randomFreeCell = getRandomFreeCell();

  if (randomFreeCell) {
    let x = randomFreeCell.x;
    let y = randomFreeCell.y;
    let color = getRandomColor();
    field[x][y] = color;
    return true;
  } else {
    return false;
  }
}

/**
 * Добавляет новые шарики на игровое поле после хода игрока.
 * Если свободные ячейки есть, добавляет заданное количество шариков (`newBallsEachTurn`).
 * Если свободных ячеек нет, завершает игру, устанавливая `isGameOver` в `true`.
 * @returns {void}
 */
function addNewBalls() {
  for (let i = 0; i < newBallsEachTurn; i++) {
    if (!addRandomBall()) {
      isGameOver = true;
      break;
    }
  }
}

/**
 * Находит кратчайший путь от одной ячейки к другой с помощью алгоритма A*.
 * Использует библиотеку astar.js для поиска пути.
 * @param {number} startX - Координата X начальной ячейки.
 * @param {number} startY - Координата Y начальной ячейки.
 * @param {number} endX - Координата X конечной ячейки.
 * @param {number} endY - Координата Y конечной ячейки.
 * @returns {Array} Массив, содержащий кратчайший путь от начальной ячейки к конечной.
 *                  Если длина массива равна нулю, значит путь не найден.
 */
function findPath(startX, startY, endX, endY) {
  // Создадим массив для astar.js
  let graphArray = [];
  for (let i = 0; i < fieldSize; i++) {
    graphArray[i] = [];
  }

  for (let yy = 0; yy < fieldSize; yy++) {
    for (let xx = 0; xx < fieldSize; xx++) {
      graphArray[xx][yy] = field[xx][yy] != null ? 0 : 1; // 0 = wall, 1 = clear
    }
  }

  let graph = new Graph(graphArray);
  let start = graph.grid[startX][startY];
  let end = graph.grid[endX][endY];

  return astar.search(graph, start, end);
}

/**
 * Проверяет, есть ли в массиве `field` линия шариков одного цвета (горизонтальная или вертикальная).
 * Если линия найдена, возвращает массив объектов с информацией о ячейках линии
 * `[{x, y, color}]`. Если линии нет, возвращает `null`.
 * @returns {Array|null} Массив с информацией о найденной линии или `null`, если линия не найдена.
 */
function findLine(x, y, dx, dy, lineArray) {
  // При первом вызове lineArray[0] содержит объект с информацией о начальной ячейке - {x, y, color}
  let prevColor = lineArray[lineArray.length - 1].color;

  let color = field[x][y];
  if (color == null || color != prevColor) {
    // Если текущая ячейка пустая или цвет шарика не совпадает с предыдущим, завершаем поиск
    return lineArray;
  }

  if (color == prevColor) {
    // Добавляем текущую ячейку с шариком совпадающего цвета в массив линии
    lineArray.push({ x: x, y: y, color: color });
  }

  // Решаем, нужно ли продолжать поиск в текущем направлении
  if ((dx && x == fieldSize - 1) || (dy && dy > 0 && y == fieldSize - 1) || (dy && dy < 0 && y == 0)) {
    return lineArray;
  } else {
    return findLine(x + dx, y + dy, dx, dy, lineArray);
  }
}

/**
 * Ищет линии шариков одного цвета в массиве `field`.
 * Проверяет горизонтальные и вертикальные линии, начиная с каждой ячейки.
 * Если линия найдена, возвращает массив объектов с информацией о ячейках линии
 * `[{x, y, color}]`. Если линии нет, возвращает null.
 * @returns {Array|null} Массив с информацией о найденной линии или `null`, если линия не найдена.
 */
function searchForLine() {
  const deltas = [
    { dx: 1, dy: 0 }, // горизонтально
    { dx: 0, dy: 1 }, // вертикально
    { dx: 1, dy: 1 }, // диагональ вправо-вниз
    { dx: 1, dy: -1 }, // диагональ вправо-вверх
  ];

  for (let iDelta = 0; iDelta < deltas.length; iDelta++) {
    let dx = deltas[iDelta].dx;
    let dy = deltas[iDelta].dy;

    // Определяем границы для оптимизации поиска
    let maxX = dx ? fieldSize - minLineLength + 1 : fieldSize;
    let maxY, minY;

    if (dy > 0) {
      // Для направлений вниз
      maxY = fieldSize - minLineLength + 1;
      minY = 0;
    } else if (dy < 0) {
      // Для направлений вверх
      maxY = fieldSize;
      minY = minLineLength - 1;
    } else {
      // Для горизонтального направления
      maxY = fieldSize;
      minY = 0;
    }

    for (let y = minY; y < maxY; y++) {
      for (let x = 0; x < maxX; x++) {
        // Начинаем поиск линии с текущей ячейки, только если в ней есть шарик
        if (field[x][y]) {
          let line = findLine(x + dx, y + dy, dx, dy, [
            {
              x: x,
              y: y,
              color: field[x][y],
            },
          ]);
          if (line.length >= minLineLength) {
            return line;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Удаляет линию шариков из массива `field`.
 * Принимает массив объектов с информацией о ячейках линии `[{x, y, color}].`
 * Удаляет шарики из ячеек, установив их значение в `null`.
 * @param {Array} lineArray - Массив объектов с информацией о ячейках линии
 *                            `[{x, y, color}]`.
 */
function removeLine(lineArray) {
  lineArray.forEach((value) => {
    field[value.x][value.y] = null;
  });
}

/**
 * Ищет линию шариков в массиве `field` и удаляет ее, если она найдена.
 * @returns {boolean} `true`, если линия найдена и удалена, иначе `false`.
 */
function findAndRemoveLine() {
  let line = searchForLine();
  if (line) {
    removeLine(line);
    return true;
  }
  return false;
}

/**
 * Обрабатывает ход игрока, перемещая выбранный шарик в целевую ячейку.
 * Проверяет, есть ли путь от выбранного шарика к целевой ячейке.
 * Если путь найден, перемещает шарик и проверяет наличие линии шариков.
 * Если линия найдена, удаляет ее из поля. Если линии нет,
 * добавляет новые шарики на поле.
 * @param {number} toX - Координата X целевой ячейки.
 * @param {number} toY - Координата Y целевой ячейки.
 * @returns {boolean} `true`, если ход успешно выполнен, иначе `false`.
 */
function handlePlayerMove(toX, toY) {
  // Ход игрока в целевую ячейку невозможен, если шарик не выбран или ячейка занята
  if (!selectedBall || field[toX][toY] !== null) {
    return false;
  }

  let path = findPath(selectedBall.x, selectedBall.y, toX, toY);

  if (path.length > 0) {
    // Если есть путь для шарика в ячейку, перемещаем шарик
    let color = field[selectedBall.x][selectedBall.y];
    field[selectedBall.x][selectedBall.y] = null;
    field[toX][toY] = color;

    selectedBall = null;

    // Проверяем, собрана ли линия из шариков
    let isLine = findAndRemoveLine();
    if (!isLine) {
      // Новые шарики добавляются, только если линия не собрана
      addNewBalls();
      // После появления шариков линия может собраться, поэтому поищем повторно
      findAndRemoveLine();
    }

    return true; // Ход успешно выполнен
  }

  return false; // Ход невозможен, если нет пути
}

// MARK: Интерфейс

/**
 * Отрисовывает шарики на игровом поле.
 * Рендерит массив `field` в виде сетки в элементе `field`.
 * Если шарик выбран, добавляет класс `ball-selected` к соответствующему элементу.
 * Если ячейка пуста, оставляет ее пустой.
 */
function drawBalls() {
  for (let y = 0; y < fieldSize; y++) {
    for (let x = 0; x < fieldSize; x++) {
      let cellDiv = document.getElementById(`cell-${x}-${y}`);
      let color = null;
      let isSelected = false;

      if (field[x][y] != null) {
        color = field[x][y];

        if (selectedBall) {
          if (selectedBall.x == x && selectedBall.y == y) {
            isSelected = true;
          }
        }

        cellDiv.innerHTML = `<div id="ball-${x}-${y}" class="ball ball-${color} ${
          isSelected ? " ball-selected" : " "
        }" data-x="${x}" data-y="${y}" onclick="onBallClick(event);"></div>`;
      } else {
        cellDiv.innerHTML = "";
      }
    }
  }
}

/**
 * Обработчик клика по шарикам.
 * Устанавливает `selectedBall` в координаты выбранного шарика и перерисовывает поле.
 * @param {Event} event - Событие клика по шарикам.
 */
function onBallClick(event) {
  if (event.target.id.startsWith("ball-")) {
    const x = parseInt(event.target.dataset.x, 10);
    const y = parseInt(event.target.dataset.y, 10);

    selectBall(x, y);
    drawBalls();
  }

  event.stopPropagation();
}

/**
 * Обработчик клика по свободным ячейкам. Вызывает обработку логики хода игрока.
 * @param {Event} event - Событие клика по ячейкам.
 */
function onCellClick(event) {
  if (event.target.id.startsWith("cell-")) {
    // Получаем координаты ячейки, по которой кликнул игрок
    let x = parseInt(event.target.dataset.x, 10);
    let y = parseInt(event.target.dataset.y, 10);

    const isMoveSuccessful = handlePlayerMove(x, y);

    if (isMoveSuccessful) {
      // Если ход успешен, перерисовываем поле
      unlitAllCells();
      drawBalls();
    }
  }

  event.stopPropagation();
}

/**
 * Получает элемент ячейки по координатам (x, y).
 * Используется для получения элемента ячейки по ID, который формируется как `cell-x-y`.
 * @param {number} x - Координата X ячейки.
 * @param {number} y - Координата Y ячейки.
 * @returns {HTMLElement} Элемент ячейки с ID `cell-x-y`.
 */
function getCellDiv(x, y) {
  const cellID = `cell-${x}-${y}`;
  return document.getElementById(cellID);
}

/**
 * Подсвечивает ячейку, представляющую собой часть пути от шарика к целевой ячейке.
 * Добавляет класс `cell-highlight-path` к элементу ячейки.
 * Используется для визуального выделения пути, найденного алгоритмом A*.
 * @param {Object} value - Объект с координатами ячейки, содержащий свойства `x` и `y`.
 */
function highlightCell(value) {
  let cellDiv = getCellDiv(value.x, value.y);
  cellDiv.classList.add("cell-highlight-path");
}

/**
 * Снимает подсветку со всех ячеек, удаляя класс `cell-highlight-path`.
 * Используется для сброса состояния ячеек после завершения подсветки пути.
 */
function unlitAllCells() {
  for (let y = 0; y < fieldSize; y++) {
    for (let x = 0; x < fieldSize; x++) {
      getCellDiv(x, y).classList.remove("cell-highlight-path");
    }
  }
}

/**
 * Обработчик наведения мыши на ячейки.
 * Если выбран шарик, пытается найти путь от шарика к текущей ячейке.
 * Если путь найден, подсвечивает ячейку шарика и путь к целевой ячейке.
 * Если путь не найден, ничего не делает.
 * @param {Event} event - Событие наведения мыши на ячейки.
 */
function onCellMouseEnter(event) {
  let x = parseInt(event.target.dataset.x, 10);
  let y = parseInt(event.target.dataset.y, 10);

  if (selectedBall) {
    let path = findPath(selectedBall.x, selectedBall.y, x, y);
    if (path.length) {
      highlightCell({ x: selectedBall.x, y: selectedBall.y });
      path.forEach(highlightCell);
    }
  }
}

/**
 * Обработчик ухода мыши с ячеек.
 * Если выбран шарик, снимает подсветку со всех ячеек, возвращая их к исходному состоянию.
 * Используется для сброса состояния ячеек после наведения мыши.
 */
function onCellMouseLeave() {
  if (selectedBall) {
    unlitAllCells();
  }
}

/**
 * Обработчик кнопки "Новая игра".
 * Если игра завершена, сбрасывает состояние игры, добавляет новые шарики и перерисовывает поле.
 */
function newGameButton() {
  startGame();
  drawBalls();
}

/**
 * Обработчик кнопки "Сбросить игру".
 * Если игра не завершена, сбрасывает состояние игры и перерисовывает поле.
 */
function resetGameButton() {
  resetGame();
  drawBalls();
}

// MARK: Точка входа

/*
 * Инициализация игрового поля.
 * Создает HTML-элементы для ячеек игрового поля и заполняет их пустыми ячейками.
 */
fieldDiv = document.getElementById("field");
for (let y = 0; y < fieldSize; y++) {
  for (let x = 0; x < fieldSize; x++) {
    fieldDiv.innerHTML += `<div id="cell-${x}-${y}" class="cell" data-x="${x}" data-y="${y}" onclick="onCellClick(event);" onmouseenter="onCellMouseEnter(event);" onmouseleave="onCellMouseLeave(event);"></div>`;
  }
}

/*
 * Сброс состояния игрового поля.
 * Очищает массив `field`, устанавливая все ячейки в `null`.
 */
resetFieldArray();
