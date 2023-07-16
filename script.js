//
// Global stuff
//
const fieldSize = 9;
const ballColors = ["purple", "red", "blue", "navy", "yellow", "green"];
const newBallsEachTurn = 3;
const minLineLength = 5;
let field = [];
let isGameOver = true;
let selectedBall = null;

//
// Game logic functions
//
function resetFieldArray() {
  for (let i = 0; i < fieldSize; i++) {
    field[i] = [];
    for (let j = 0; j < fieldSize; j++) {
      field[i][j] = null;
    }
  }
}

function getFreeCells() {
  // Returns list of free cells in field array, each cell represented by object like {x: 0, y: 0}
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

function getRandomFreeCell() {
  // Returns random free cell coords as object {x: 0, y: 0}
  let freeCells = getFreeCells();
  let randomFreeCell = null;

  if (freeCells) {
    let randomCellIndex = Math.floor(Math.random() * freeCells.length);
    // console.log(freeCells);
    randomFreeCell = freeCells[randomCellIndex];
  }

  return randomFreeCell;
}

function getRandomColor() {
  // Returns a random color name
  let randomColorIndex = Math.floor(Math.random() * ballColors.length);
  return ballColors[randomColorIndex];
}

function addRandomBall() {
  // Adds a random ball to the game field
  // Returns true if ball was added, otherwise false
  let randomFreeCell = getRandomFreeCell();

  if (randomFreeCell) {
    let x = randomFreeCell.x;
    let y = randomFreeCell.y;
    let color = getRandomColor();
    // console.log(`Random cell is (${x}, ${y}); random color is ${color}`);
    field[x][y] = color;
    return true;
  } else {
    return false;
  }
}

function addNewBalls() {
  //
  // Adds new balls to the field after player's move
  //
  for (let i = 0; i < newBallsEachTurn; i++) {
    if (!addRandomBall()) {
      isGameOver = true;
      break;
    }
  }
}

function findPath(startX, startY, endX, endY) {
  // Return array containing the shortest path
  // Length of array equal to zero means there's no available path.

  // Create array for astar.js
  // 0 = wall, 1 = clear
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

  return astar.search(graph, start, end); // return array containing the shortest path
}

function findLine(x, y, dx, dy, lineArray) {
  //
  // Recursive function to find a line of balls of the same color in the `field` array.
  // Currently ONLY horizontal/vertical lines.
  // on first call, lineArray[0] contains object with info about starting cell
  // {x, y, color}
  let prevColor = lineArray[lineArray.length - 1].color;

  let color = field[x][y];
  if (color == null || color != prevColor) {
    // If current cell is clear or contains ball of another color, end recursion
    return lineArray;
  }

  if (color == prevColor) {
    // Add this cell to line array
    lineArray.push({ x: x, y: y, color: color });
  }

  // Decide if we stop or continue recursion
  if ((dx && x == fieldSize - 1) || (dy && y == fieldSize - 1)) {
    return lineArray;
  } else {
    return findLine(x + dx, y + dy, dx, dy, lineArray);
  }
}

function searchForLines() {
  //
  // Scans `field` for lines of balls of same color with `minLineLength`
  // (Currently ONLY horizontal/vertical lines!)
  // Returns: line array [{x, y, color}] or `null`.
  //
  const deltas = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
  ];

  for (let iDelta = 0; iDelta < deltas.length; iDelta++) {
    let dx = deltas[iDelta].dx;
    let dy = deltas[iDelta].dy;

    let maxX = dx ? fieldSize - minLineLength + 1 : fieldSize;
    let maxY = dy ? fieldSize - minLineLength + 1 : fieldSize;

    for (let y = 0; y < maxY; y++) {
      for (let x = 0; x < maxX; x++) {
        // Start search for a line only if current cell has a ball in it
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

function removeLine(
  lineArray, // array of objects {x, y, color}
) {
  lineArray.forEach((value) => {
    field[value.x][value.y] = null;
  });
}

//
// Interface functions
//
function drawBalls() {
  // Renders `field` array to the `field` div grid
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

function onBallClick(event) {
  // Sets `selectedBall` to the clicked ball's (x,y), then redraws the field
  if (event.target.id.startsWith("ball-")) {
    // console.log(`Ball selected (x=${event.target.dataset.x}, y=${event.target.dataset.y})`);
    selectedBall = {
      x: event.target.dataset.x,
      y: event.target.dataset.y,
    };
    drawBalls();
  }

  event.stopPropagation();
}

function onCellClick(event) {
  // Moves selected ball to the clicked cell (if it's free), then redraws the field.
  if (event.target.id.startsWith("cell-")) {
    let x = event.target.dataset.x;
    let y = event.target.dataset.y;
    // console.log(`Cell (x=${x}, y=${y})`);

    if (selectedBall) {
      if (field[x][y] == null) {
        // Act only if the clicked cell is free!

        let path = findPath(selectedBall.x, selectedBall.y, x, y);
        // console.log(path);

        if (path.length) {
          // Actually move the ball if there's path, reset stuff
          let color = field[selectedBall.x][selectedBall.y];
          field[selectedBall.x][selectedBall.y] = null;
          field[x][y] = color;
          selectedBall = null;
          unlitAllCells();
          addNewBalls();

          line = searchForLines();
          if (line) {
            console.log("FOUND A LINE!");
            console.log(line);
            removeLine(line);
          }
        }

        drawBalls();
      }
    }
  }

  event.stopPropagation();
}

function getCellDiv(x, y) {
  const cellID = `cell-${x}-${y}`;
  return document.getElementById(cellID);
}

function highlightCell(value) {
  // `value` is a cell object from astar.js-generated path
  let cellDiv = getCellDiv(value.x, value.y);
  cellDiv.classList.add("cell-highlight-path");
}

function unlitAllCells() {
  for (let y = 0; y < fieldSize; y++) {
    for (let x = 0; x < fieldSize; x++) {
      getCellDiv(x, y).classList.remove("cell-highlight-path");
    }
  }
}

function onCellMouseEnter(event) {
  //
  // If a ball selected, try to build path to underlying cell and highlight the path.
  //
  let x = event.target.dataset.x;
  let y = event.target.dataset.y;
  // console.log(`> Mouse entered cell (x=${x}, y=${y})`);

  if (selectedBall) {
    // Try to find the path for selected ball to the current cell
    let path = findPath(selectedBall.x, selectedBall.y, x, y);
    if (path.length) {
      // console.log('Ball can get here!');
      // Highlight ball's location and the path
      highlightCell({ x: selectedBall.x, y: selectedBall.y });
      path.forEach(highlightCell);
    } else {
      // console.log('Ball CAN NOT get here!');
    }
  }
}

function onCellMouseLeave(event) {
  //
  // Reset cells colors to default (if any ball is selected).
  //
  let x = event.target.dataset.x;
  let y = event.target.dataset.y;
  // console.log(`< Mouse left cell (x=${x}, y=${y})`);

  if (selectedBall) {
    unlitAllCells();
  }
}

function newGameButton() {
  if (isGameOver) {
    isGameOver = false;
    addNewBalls();
    drawBalls();
  }
}

function resetGameButton() {
  if (!isGameOver) {
    isGameOver = true;
    resetFieldArray();
    drawBalls();
  }
}

//
// Program entry point
//

// Fill field with cells
fieldDiv = document.getElementById("field");
for (let y = 0; y < fieldSize; y++) {
  for (let x = 0; x < fieldSize; x++) {
    fieldDiv.innerHTML += `<div id="cell-${x}-${y}" class="cell" data-x="${x}" data-y="${y}" onclick="onCellClick(event);" onmouseenter="onCellMouseEnter(event);" onmouseleave="onCellMouseLeave(event);"></div>`;
  }
}

resetFieldArray();
