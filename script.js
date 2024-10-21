const SIZE = 9; // Sudoku board size
const SUBGRID_SIZE = 3; // Size of the subgrid

// Function to create an empty board
function createEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

// Function to check if a number can be placed in a given position
function isValid(board, row, col, num) {
    // Check the row
    for (let c = 0; c < SIZE; c++) {
        if (board[row][c] === num) {
            return false;
        }
    }
    // Check the column
    for (let r = 0; r < SIZE; r++) {
        if (board[r][col] === num) {
            return false;
        }
    }
    // Check the 3x3 subgrid
    const startRow = row - (row % SUBGRID_SIZE);
    const startCol = col - (col % SUBGRID_SIZE);
    for (let r = 0; r < SUBGRID_SIZE; r++) {
        for (let c = 0; c < SUBGRID_SIZE; c++) {
            if (board[r + startRow][c + startCol] === num) {
                return false;
            }
        }
    }
    return true;
}

// Backtracking function to solve Sudoku
function solveSudoku(board) {
    const emptyCell = findEmptyCell(board);
    if (!emptyCell) {
        return true; // Solved
    }
    const [row, col] = emptyCell;

    for (let num = 1; num <= SIZE; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
                return true;
            }
            board[row][col] = 0; // Reset on backtrack
        }
    }
    return false;
}

// Function to find an empty cell in the board
function findEmptyCell(board) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) {
                return [r, c];
            }
        }
    }
    return null;
}

// Function to remove numbers to create the puzzle
function removeNumbers(board, attempts) {
    while (attempts > 0) {
        const row = Math.floor(Math.random() * SIZE);
        const col = Math.floor(Math.random() * SIZE);
        if (board[row][col] !== 0) {
            const backup = board[row][col];
            board[row][col] = 0; // Remove the number

            // Check if there's still a unique solution
            if (!hasUniqueSolution(board)) {
                board[row][col] = backup; // Restore if not unique
            } else {
                attempts--;
            }
        }
    }
}

// Check if there's a unique solution
function hasUniqueSolution(board) {
    let solutions = 0;

    const backtracking = () => {
        const emptyCell = findEmptyCell(board);
        if (!emptyCell) {
            solutions++;
            return;
        }
        const [row, col] = emptyCell;

        for (let num = 1; num <= SIZE; num++) {
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                backtracking();
                board[row][col] = 0; // Reset on backtrack
                if (solutions > 1) break; // Early stop if we found more than one solution
            }
        }
    };

    backtracking();
    return solutions === 1; // Check for unique solution
}

// Function to generate a Sudoku puzzle
function generateSudoku() {
    const board = createEmptyBoard();
    for (let i = 0; i < SIZE; i += SUBGRID_SIZE) {
        fillSubgrid(board, i, i);
    }
    solveSudoku(board);
    removeNumbers(board, 30); // Adjust attempts for difficulty
    return board;
}

function fillSubgrid(board, row, col) {
    const nums = Array.from({ length: SIZE }, (_, index) => index + 1);
    nums.sort(() => Math.random() - 0.5); // Shuffle numbers
    for (let r = 0; r < SUBGRID_SIZE; r++) {
        for (let c = 0; c < SUBGRID_SIZE; c++) {
            board[row + r][col + c] = nums.pop();
        }
    }
}

// Initial board and solution
let initialBoard = generateSudoku(); // Generate new Sudoku instead of hardcoding
let initialPuzzle = JSON.parse(JSON.stringify(initialBoard)); // Store the solution
let solvedPuzzle = solveSudoku(initialPuzzle);

// Function to render the Sudoku board
function renderBoard() {
    const boardElement = document.getElementById('sudoku-board');
    boardElement.innerHTML = ''; // Clear previous board

    initialBoard.forEach((row) => {
        const rowElement = document.createElement('tr'); // Create table row

        row.forEach((cell) => {
            const cellElement = document.createElement('td'); // Create table cell
            const inputElement = document.createElement('input');

            inputElement.type = 'text'; // Change to text to remove spinners
            inputElement.maxLength = '1'; // Limit to single digit input
            inputElement.value = cell !== 0 ? cell : '';
            inputElement.disabled = cell !== 0; // Disable input for predefined cells

            // Allow input for empty cells
            inputElement.addEventListener('input', function () {
                // Only allow number inputs and limit to 1 digit
                this.value = this.value.replace(/[^1-9]/g, '');
            });

            cellElement.appendChild(inputElement);
            rowElement.appendChild(cellElement);
        });

        boardElement.appendChild(rowElement); // Append the row to the board
    });
}

// Function to check the solution
function checkSolution() {
    const boardElement = document.getElementById('sudoku-board');
    const inputs = boardElement.getElementsByTagName('input');

    // Iterate over each cell of the board to compare user input to the solution
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const userInput = parseInt(inputs[i * SIZE + j].value.trim(), 10); // Get user input and convert to number
            const correctValue = initialPuzzle[i][j]; // Fetch the correct solution value

            // Compare the values, allowing for zero (empty space) to match
            if (userInput !== 0 && userInput !== correctValue && !Number.isNaN(userInput)) {
                alert("You made a mistake.");
                return;
            }
        }
    }
    alert("You're doing great!");
}

// Reset the board to initial state
function resetBoard() {
    initialBoard = initialBoard; // Set a original Sudoku puzzle
    renderBoard();
}

// Function to generate a new Sudoku puzzle and render it
function generateNewPuzzle() {
    initialBoard = generateSudoku(); // Generate a new Sudoku puzzle
    initialPuzzle = JSON.parse(JSON.stringify(initialBoard)); // Store the solution
    renderBoard();
    solvedPuzzle = solveSudoku(initialPuzzle);
}


// Event listener for new button
document.getElementById('new-button').addEventListener('click', generateNewPuzzle);

// Event listener for reset button
document.getElementById('reset-button').addEventListener('click', resetBoard);

// Event listener for check solution button
document.getElementById('check-button').addEventListener('click', checkSolution);

// Initial render
renderBoard();