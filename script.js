const gameBoard = (function () { //Will control everything relating to the gameboard
    /*
    Below is a 2d Array of objects to store a matrix of game data.
    The 2d array uses the concept of a "magic square" 
    i.e the unique value property of all rows, columns and the two diagonals sum to a number
    or "magical constant" - in this case 15:
    */
    const board = [[{ value: 8, player: null }, { value: 1, player: null }, { value: 6, player: null }],
    [{ value: 3, player: null }, { value: 5, player: null }, { value: 7, player: null }],
    [{ value: 4, player: null }, { value: 9, player: null }, { value: 2, player: null }]];

    const getBoard = () => board; //Exposes board variable while keeping it private in lexical scope/closure.

    const claimCell = (rowSelection, columnSelection, playerSymbol) => {
        if (board[rowSelection][columnSelection].player === null) {
            board[rowSelection][columnSelection].player = `${playerSymbol}`;
        }
    };

    const clearBoard = () => {
        for (let row of board) {
            for (let cell of row) {
                cell.player = null;
            }
        }
    };

    const getLinesFromSelectedCell = (rowSelection, columnSelection) => { //This will return the row, column and diagonal of the player's selected cell.
        const row = board[rowSelection];
        const col = board.map(row => row[columnSelection]);
        let primaryDiagonal = [board[0][0], board[1][1], board[2][2]];
        let secondaryDiagonal = [board[0][2], board[1][1], board[2][0]];
        return { row, col, primaryDiagonal, secondaryDiagonal }
    };

    return { getBoard, claimCell, getLinesFromSelectedCell, clearBoard };
})();

function Player(name, symbol) { //Factory function for player creation.
    const userName = name;
    const userSymbol = symbol;
    return { userName, userSymbol }
};

function GameController() { //will control all aspects of the game.
    let currentPlayer;
    let roundCount = 0;
    let gameResult = "";
    let gameWinner = null;
    let gameOver = false;
    let players = {};

    function createPlayers(playerOneName, playerTwoName) {
        players = {
            playerOne: Player(playerOneName, "x"),
            playerTwo: Player(playerTwoName, "o"),
        };
        currentPlayer = players.playerOne;
        return players;
    };

    const getGameStatus = () => gameOver;

    const getGameResult = () => gameResult;

    const getCurrentPlayer = () => currentPlayer;

    const switchPlayerTurn = () => {
        currentPlayer === players.playerOne ? currentPlayer = players.playerTwo
            : currentPlayer = players.playerOne; //If current turn is player one, then switch to two, and vice versa
            console.log(currentPlayer);
    };


    const resetGame = () => { //Resets game parameters.
        roundCount = 0;
        currentPlayer = players.playerOne;
        gameResult = "";
        gameWinner = null;
        gameOver = false;
        gameBoard.clearBoard();
        uiController.clearUI();
    };

    const playRound = (rowSelection, columnSelection) => {
        if (gameOver) { //If the game has a winner, the game is over.
            return
        }
        if (gameBoard.getBoard()[rowSelection][columnSelection].player !== null) { //If the cell has already been selected.
            return;
        }
        roundCount++;
        gameBoard.claimCell(rowSelection, columnSelection, getCurrentPlayer().userSymbol);
        checkForWin(getCurrentPlayer(), rowSelection, columnSelection);
        switchPlayerTurn();
    };

    const checkForWin = (player, rowSelection, columnSelection) => {
        const { row, col, primaryDiagonal, secondaryDiagonal } = gameBoard.getLinesFromSelectedCell(rowSelection, columnSelection); // Destructuring the returned object.

        const isWinningLine = (line) => { //Because of the magic square, we just need to check each line (row, col or diagonal) held by the player to see if they total to the magic constant (15).
            let playerCells = line.filter(cell => cell.player === player.userSymbol);
            let playerSum = playerCells.reduce((sum, cell) => sum + cell.value, 0);
            return playerSum === 15;
        };

        if (isWinningLine(row) || isWinningLine(col) || isWinningLine(primaryDiagonal) || (isWinningLine(secondaryDiagonal))) //If any of the win conditions are met.
        {
            gameWinner = player.userName;
            gameResult = `${gameWinner} has won the game!`;
            gameOver = true;
            return;
        }

        if (roundCount === 9) { //If all 9 turns have been used, the game must be a draw.
            gameResult = "It's a draw!";
            gameOver = true;
            return;
        };
    };

    return { getGameStatus, getGameResult, switchPlayerTurn, getCurrentPlayer, playRound, checkForWin, resetGame, createPlayers };
};

const uiController = (function () { //will control the users interaction with UI elements
    const domElements = {}; //Initialize object to hold dom elements for reusability sake.

    const game = GameController();

    const cacheDOM = () => {
        domElements.cellGrid = document.querySelector(".game-cells-grid");
        domElements.displayedMessage = document.querySelector("h3");
        domElements.playerForm = document.querySelector("form");
        domElements.playerFormWrapper = document.querySelector(".player-form-wrapper");
        domElements.gameContent = document.querySelector(".game-content");
        domElements.resetButton = document.querySelector(".reset");
    };

    const getDOMElements = () => {
        if (Object.keys(domElements).length === 0) { //We want to keep caching to a minimum
            cacheDOM();
        }
        return domElements;
    };

    const addCellEventListener = (() => { //Event delegation to save memory/performance
        const { cellGrid, displayedMessage } = getDOMElements();

        cellGrid.addEventListener("click", (e) => {
            if (!game.getGameStatus()) { //Game not over
                if (e.target.classList.contains("cell")) { //Just to make sure we are clicking on a cell item.
                    if (e.target.innerHTML === "") { //Clicked on cell must be empty/not claimed.
                        writeToElement(e.target, game.getCurrentPlayer().userSymbol);
                        game.playRound(e.target.getAttribute("row"), e.target.getAttribute("column"));
                        writeToElement(displayedMessage, `${game.getCurrentPlayer().userName}'s turn!`);
                    }
                }
            } else return;
        });
    });

    const addResetButtonEventListener = (() => {
        const { resetButton } = getDOMElements();
        resetButton.addEventListener("click", () => { 
            game.resetGame()
            resetButton.classList.add("no-click");
            resetButton.classList.remove("show");
        }
    )});

    const writeToElement = (element, content) => {
        const { displayedMessage, resetButton } = getDOMElements();
        if (game.getGameStatus()) { //If game is over;
            displayedMessage.textContent = game.getGameResult();
            resetButton.classList.remove("no-click");
            setTimeout(() => resetButton.classList.add("show"), 10);
        } else element.textContent = content;
    };

    const playerFormSubmitHandler = (() => {
        const { playerForm, playerFormWrapper, gameContent, displayedMessage } = getDOMElements();
        playerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            e.target.classList.add("no-click");
            const playerOneName = e.target.querySelector("input:first-of-type").value === "" ? "Player One" : e.target.querySelector("input:first-of-type").value;
            const playerTwoName = e.target.querySelector("input:last-of-type").value === "" ? "Player Two" : e.target.querySelector("input:last-of-type").value;
            game.createPlayers(playerOneName, playerTwoName);
            writeToElement(displayedMessage, `${playerOneName}'s turn!`);
            playerFormWrapper.classList.add("fade-out");
            buildTable();
            setTimeout(() => playerFormWrapper.classList.add("hidden"), 300);
            gameContent.style.display = 'block';
            setTimeout(() => { gameContent.classList.add('show'); }, 400);
        });
    })();

    const buildTable = (() => {
        const { cellGrid } = getDOMElements();
        let board = gameBoard.getBoard();
        for (let rowIndex = 0; rowIndex < board.length; rowIndex++) { //Use nested for loops to loop through multi-dimensional array
            for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
                const gameCell = document.createElement("div");
                gameCell.classList.add("cell");
                gameCell.setAttribute("row", rowIndex);
                gameCell.setAttribute("column", colIndex);
                cellGrid.appendChild(gameCell);
            };
        };
        addCellEventListener();
        addResetButtonEventListener();
    });

    const clearUI = () => {
        const { displayedMessage } = getDOMElements();
        domElements.cells = document.querySelectorAll(".cell");
        writeToElement(displayedMessage, `${game.getCurrentPlayer().userName}'s turn!`);
        domElements.cells.forEach(cell => {
            console.log(cell);
            writeToElement(cell, "");
        });
    }

    return { clearUI };
})();