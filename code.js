// Updated JavaScript with new rule functionality and responsive design
let rows = 15;
let cols = 15;
let playing = false;
let timer;
let reproductionTime = 500;
let grid, nextGrid;
let colorfulMode = false;
let cellSize = 20; // Default cell size
let currentSkin = 'default';
let customRuleActive = false; // Flag for custom rules

document.addEventListener('DOMContentLoaded', () => {
  initializeGrids();
  createTable();
  setupControlButtons();

  document.querySelector('#settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    rows = parseInt(document.getElementById('rows').value, 10);
    cols = parseInt(document.getElementById('cols').value, 10);
    resetGame();
  });

  document.querySelector('#skinSelector').addEventListener('change', (e) => {
    currentSkin = e.target.value;
    document.body.className = currentSkin;
  });

  document.querySelector('#cellSizeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    cellSize = parseInt(document.getElementById('cellSize').value, 10);
    updateCellSize();
  });

  document.querySelector('#rulesToggle').addEventListener('change', (e) => {
    customRuleActive = e.target.checked;
    document.getElementById('rulesText').style.display = e.target.checked ? 'block' : 'none';
  });
});

function initializeGrids() {
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  nextGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
}

function createTable() {
  const gridContainer = document.getElementById('gridContainer');
  gridContainer.innerHTML = '';
  const table = document.createElement('table');

  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement('td');
      cell.id = `${i}_${j}`;
      cell.className = 'dead';
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      cell.onclick = cellClickHandler;
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  }
  gridContainer.appendChild(table);
}

function resetGame() {
  initializeGrids();
  createTable();
  updateLiveCount();
}

function cellClickHandler() {
  const [row, col] = this.id.split('_').map(Number);
  grid[row][col] = grid[row][col] === 0 ? 1 : 0;
  this.className = grid[row][col] ? `live ${colorfulMode ? 'colorful' : ''}` : 'dead';
  updateLiveCount();
}

function setupControlButtons() {
  document.getElementById('start').onclick = () => {
    playing = !playing;
    document.getElementById('start').textContent = playing ? 'Pause' : 'Start';
    if (playing) play();
  };

  document.getElementById('clear').onclick = resetGame;

  document.getElementById('random').onclick = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[i][j] = Math.random() < 0.5 ? 1 : 0;
        document.getElementById(`${i}_${j}`).className = grid[i][j]
          ? `live ${colorfulMode ? 'colorful' : ''}`
          : 'dead';
      }
    }
    updateLiveCount();
  };

  document.getElementById('colorMode').onclick = () => {
    colorfulMode = !colorfulMode;
    updateView();
  };
}

function play() {
  computeNextGen();
  if (playing) timer = setTimeout(play, reproductionTime);
}

function computeNextGen() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (customRuleActive) {
        applyCustomRules(i, j);
      } else {
        applyRules(i, j);
      }
    }
  }
  copyAndResetGrid();
  updateView();
}

function applyRules(row, col) {
  const neighbors = countNeighbors(row, col);
  nextGrid[row][col] = grid[row][col]
    ? neighbors === 2 || neighbors === 3 ? 1 : 0
    : neighbors === 3 ? 1 : 0;
}

function applyCustomRules(row, col) {
  const neighbors = countNeighbors(row, col);
  nextGrid[row][col] = grid[row][col] || neighbors > 0 ? 1 : 0; // Custom rule: no cell dies, and all neighbors become live
}

function countNeighbors(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const r = row + i, c = col + j;
      if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 1) count++;
    }
  }
  return count;
}

function copyAndResetGrid() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = nextGrid[i][j];
      nextGrid[i][j] = 0;
    }
  }
}

function updateView() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.getElementById(`${i}_${j}`);
      cell.className = grid[i][j] ? `live ${colorfulMode ? 'colorful' : ''}` : 'dead';
      if (colorfulMode) cell.style.setProperty('--rand', Math.random());
    }
  }
  updateLiveCount();
}

function updateLiveCount() {
  const liveCount = grid.flat().reduce((sum, cell) => sum + cell, 0);
  document.getElementById('liveCount').textContent = `Live Cells: ${liveCount}`;
}

function updateCellSize() {
  const cells = document.querySelectorAll('td');
  cells.forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });
}
