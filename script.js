const gameBoard = (function() {
    const board = [["1","2","3"], //2d Array to store matrix of game data in rows and columns.
                   ["4","5","6"],
                   ["7","8","9"]];

    const getBoard = () => board; //Exposes board variable while keeping it private in lexical scope/closure.

    const placeToken = (columnSelection, rowSelection, role) => {
        board[rowSelection][columnSelection] = `${role}`;
    }

    const printBoard = () => {
        for (row of getBoard()) {
            let boardRow = row.join(" ");
            console.log(boardRow);
        }
    };
    
    return { getBoard, placeToken, printBoard };
})();

function Player(name, role) { //Factory function for player creation.
    const userName = name;
    const userRole = role;
    return {userName, userRole};
};

const gameController = (function() {
    let players = {
    playerOne: Player("Player One", "x"),
    playerTwo: Player("Player Two", "o"),
    };

    let currentPlayer = players.playerOne;

        
    const switchPlayerTurn = () => {
        currentPlayer = players.playerOne ? players.playerTwo : players.playerOne; //If current turn is player one, then switch to two, and vice versa
    };

    const getCurrentPlayer = () => currentPlayer;

    const playRound = (columnSelection, rowSelection) => {
        console.log(`${getCurrentPlayer().userName} has made their decision!`);
        gameBoard.placeToken(columnSelection, rowSelection, getCurrentPlayer().userRole);
        gameBoard.printBoard();
        switchPlayerTurn();
    };

    return{ switchPlayerTurn, getCurrentPlayer, playRound };
})();