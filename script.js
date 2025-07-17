const fieldSize = 9;

// MARK: Состояние игры
const GameState = (function () {
  let field = [];
  let isGameOver = true;
  let selectedBall = null;

  // Приватные методы модуля

  /**
   * Сбрасывает игровое поле, устанавливая все ячейки в `null`.
   * Используется для инициализации нового игрового поля или сброса текущего
   * состояния игры.
   */
  function resetField() {
    field = [];
    for (let i = 0; i < fieldSize; i++) {
      field[i] = [];
      for (let j = 0; j < fieldSize; j++) {
        field[i][j] = null;
      }
    }
  }

  // Инициализация при создании модуля
  resetField();

  // Публичный API модуля
  return {
    init: resetField,
    getField: () => field,
    isGameOver: () => isGameOver,
    setGameOver: (status) => {
      isGameOver = status;
    },
    getSelectedBall: () => selectedBall,
    setSelectedBall: (x, y) => {
      selectedBall = { x, y };
    },
    clearSelectedBall: () => {
      selectedBall = null;
    },
    getBallColor: (x, y) => field[x][y],
    setBallColor: (x, y, color) => {
      field[x][y] = color;
    },
    clearCell: (x, y) => {
      field[x][y] = null;
    },
    isFreeCell: (x, y) => {
      return field[x][y] === null;
    },
  };
})();

// MARK: Логика
const GameLogic = (function () {
  const newBallsEachTurn = 3;
  const minLineLength = 5;
  const ballColors = ["purple", "red", "blue", "navy", "yellow", "green"];

  // Приватные функции модуля

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

    const field = GameState.getField();
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
   * Проверяет, есть ли на поле линия шариков одного цвета.
   * Если линия найдена, возвращает массив объектов с информацией о ячейках линии
   * `[{x, y, color}]`. Если линии нет, возвращает `null`.
   * @returns {Array|null} Массив с информацией о найденной линии или `null`, если линия не найдена.
   */
  function findLine(x, y, dx, dy, lineArray) {
    // При первом вызове lineArray[0] содержит объект с информацией о начальной ячейке - {x, y, color}
    let prevColor = lineArray[lineArray.length - 1].color;

    let color = GameState.getBallColor(x, y);
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
   * Ищет линии шариков одного цвета на поле.
   * Проверяет горизонтальные, вертикальные и диагональные линии, начиная с каждой ячейки.
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

      const field = GameState.getField();
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
   * Удаляет линию шариков с игрового поля.
   * Принимает массив объектов с информацией о ячейках линии `[{x, y, color}].`
   * Удаляет шарики из ячеек, установив их значение в `null`.
   * @param {Array} lineArray - Массив объектов с информацией о ячейках линии
   *                            `[{x, y, color}]`.
   */
  function removeLine(lineArray) {
    lineArray.forEach((value) => GameState.clearCell(value.x, value.y));
  }

  /**
   * Ищет линию шариков на игровом поле и удаляет ее, если она найдена.
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
   * Добавляет новые шарики на игровое поле после хода игрока.
   * Если свободные ячейки есть, добавляет заданное количество шариков (`newBallsEachTurn`).
   * Если свободных ячеек нет, завершает игру, устанавливая `isGameOver` в `true`.
   * @returns {void}
   */
  function addNewBalls() {
    for (let i = 0; i < newBallsEachTurn; i++) {
      if (!addRandomBall()) {
        GameState.setGameOver(true);
        break;
      }
    }
  }

  /**
   * Возвращает массив свободных ячеек игрового поля. Каждый элемент массива
   * представляет собой объект вида `{x: 0, y: 0}`, где (x, y) - координаты свободной ячейки на поле.
   * @returns {Array} Массив свободных ячеек.
   */
  function getFreeCells() {
    const field = GameState.getField();
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
   * Добавляет случайный шарик случайного цвета на игровое поле.
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
      GameState.setBallColor(x, y, color);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Проверяет, можно ли переместить шарик из одной ячейки в другую.
   * @param {*} fromX Координата X начальной ячейки.
   * @param {*} fromY Координата Y начальной ячейки.
   * @param {*} toX Координата X целевой ячейки.
   * @param {*} toY Координата Y целевой ячейки.
   * @returns true, если можно переместить шарик, иначе false.
   */
  function canMoveBall(fromX, fromY, toX, toY) {
    const path = findPath(fromX, fromY, toX, toY);
    return path.length > 0;
  }

  /**
   * Перемещает шарик из одной ячейки в другую, если есть путь.
   * Если перемещение успешно, очищает выбранный шарик.
   * @param {number} fromX - Координата X начальной ячейки.
   * @param {number} fromY - Координата Y начальной ячейки.
   * @param {number} toX - Координата X целевой ячейки.
   * @param {number} toY - Координата Y целевой ячейки
   * @returns {boolean} `true`, если перемещение успешно, иначе `false`.
   */
  function moveBall(fromX, fromY, toX, toY) {
    if (canMoveBall(fromX, fromY, toX, toY)) {
      const color = GameState.getBallColor(fromX, fromY);
      GameState.setBallColor(fromX, fromY, null);
      GameState.setBallColor(toX, toY, color);
      GameState.clearSelectedBall();
      return true; // Ход успешно выполнен
    }
    return false; // Ход невозможен, если нет пути
  }

  // Публичные методы модуля

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
    const selected = GameState.getSelectedBall();
    if (!selected || !GameState.isFreeCell(toX, toY)) {
      return false;
    }

    const hasMoved = moveBall(selected.x, selected.y, toX, toY);
    if (hasMoved) {
      // Проверяем, собрана ли линия из шариков
      if (!findAndRemoveLine()) {
        // Если линия не собрана, добавляем новые шарики
        addNewBalls();
        // После появления шариков линия может собраться, поэтому поищем повторно
        findAndRemoveLine();
      }
      return true; // Ход успешно выполнен
    }
    return false; // Ход невозможен, если нет пути
  }

  /**
   * Запускает новую игру, сбрасывая состояние и добавляя новые шарики.
   */
  function startGame() {
    if (GameState.isGameOver()) {
      GameState.setGameOver(false);
      GameState.init();
      addNewBalls();
    }
  }

  /**
   * Сбрасывает состояние игры.
   */
  function resetGame() {
    if (!GameState.isGameOver()) {
      GameState.setGameOver(true);
      GameState.init();
    }
  }

  // Публичный API
  return {
    handlePlayerMove,
    selectBall: GameState.setSelectedBall,
    getSelectedBall: GameState.getSelectedBall,
    getHighlightedCells: (fromX, fromY, toX, toY) => findPath(fromX, fromY, toX, toY),
    startGame,
    resetGame,
  };
})();

// MARK: Интерфейс
const GameUI = (function () {
  // Приватные функции

  /**
   * Отрисовывает шарики на игровом поле.
   * Рендерит массив `field` в виде сетки в элементе `field`.
   * Если шарик выбран, добавляет класс `ball-selected` к соответствующему элементу.
   * Если ячейка пуста, оставляет ее пустой.
   */
  function drawBalls() {
    const field = GameState.getField();
    const selectedBall = GameState.getSelectedBall();

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

          // Создаем элемент шарика и добавляем его в ячейку
          cellDiv.innerHTML = "";
          const ballDiv = document.createElement("div");
          ballDiv.id = `ball-${x}-${y}`;
          ballDiv.className = `ball ball-${color} ${isSelected ? "ball-selected" : ""}`;
          ballDiv.dataset.x = x;
          ballDiv.dataset.y = y;
          ballDiv.onclick = onBallClick;
          cellDiv.appendChild(ballDiv);
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

      GameLogic.selectBall(x, y);
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

      const isMoveSuccessful = GameLogic.handlePlayerMove(x, y);

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

    const selectedBall = GameLogic.getSelectedBall();
    if (selectedBall) {
      let path = GameLogic.getHighlightedCells(selectedBall.x, selectedBall.y, x, y);
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
    if (GameLogic.getSelectedBall()) {
      unlitAllCells();
    }
  }

  /**
   * Обработчик кнопки "Новая игра".
   * Если игра завершена, сбрасывает состояние игры, добавляет новые шарики и перерисовывает поле.
   */
  function newGameButton() {
    GameLogic.startGame();
    drawBalls();
  }

  /**
   * Обработчик кнопки "Сбросить игру".
   * Если игра не завершена, сбрасывает состояние игры и перерисовывает поле.
   */
  function resetGameButton() {
    GameLogic.resetGame();
    drawBalls();
  }

  // Публичный API
  return {
    /*
     * Инициализация игрового поля.
     * Создает HTML-элементы для ячеек игрового поля и заполняет их пустыми ячейками.
     */
    init: function () {
      fieldDiv = document.getElementById("field");
      for (let y = 0; y < fieldSize; y++) {
        for (let x = 0; x < fieldSize; x++) {
          // Создаем элемент ячейки и добавляем его в поле
          const cellDiv = document.createElement("div");
          cellDiv.id = `cell-${x}-${y}`;
          cellDiv.className = "cell";
          cellDiv.dataset.x = x;
          cellDiv.dataset.y = y;
          fieldDiv.appendChild(cellDiv);

          // Добавляем обработчики событий для каждой ячейки
          cellDiv.addEventListener("click", onCellClick);
          cellDiv.addEventListener("mouseenter", onCellMouseEnter);
          cellDiv.addEventListener("mouseleave", onCellMouseLeave);
        }
      }

      // Добавляем обработчики событий для кнопок
      btnNewGame = document.getElementById("btn-new-game");
      btnNewGame.addEventListener("click", newGameButton);
      btnReset = document.getElementById("btn-reset");
      btnReset.addEventListener("click", resetGameButton);

      drawBalls();
    },
  };
})();

// MARK: Точка входа
GameUI.init();
