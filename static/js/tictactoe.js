var player;
var winner = null;
var playerXTurn = true;
const squares = document.querySelectorAll('button');
var displayTurn = document.querySelector('#turn');
displayTurn.innerHTML = "It's player X's turn";


const winningCombinations = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];




function checkForWinner() {
	winningCombinations.forEach(function(combo) {
		let [a, b, c] = combo;
		if (squares[a].innerHTML &&
			squares[a].innerHTML === squares[b].innerHTML &&
			squares[b].innerHTML === squares[c].innerHTML) {
			winner = squares[a].innerHTML;
		}
	})
}

function handleSquareClick(square) {
	let player2 = document.getElementById('player2').innerHTML;
	if (!square.innerHTML && !winner && player2 != "") {
		playerXTurn ? square.innerHTML = 'X' : square.innerHTML = 'O';
		playerXTurn = !playerXTurn;
		playerXTurn ? displayTurn.innerHTML = "It's player X's turn" : displayTurn.innerHTML = "It's player O's turn";

		// send index of square through socket
		let squareIndex = Array.prototype.indexOf.call(squares, square);
		socket.emit('player move', squareIndex);
	}

	checkForWinner();
	if (winner) { displayTurn.innerHTML = `Player ${winner} wins!` }
}

function userLogin() {
	let username = document.querySelector('input').value;
	let registerDiv = document.getElementById('register');
	let player1Name = document.getElementById('player1');
	if (username != "") {
		socket.emit('login', username);
		registerDiv.style.display = "none";
		player1Name.innerHTML ? player = 'O' : player = 'X';
	}
}

socket.on('login', function(username, playerNumber) {
	let li = document.getElementById(`player${playerNumber}`);
	li.innerHTML = username;
});

socket.on('player move', function(squareIndex) {
	let square = squares[squareIndex];
	handleSquareClick(square);
});





