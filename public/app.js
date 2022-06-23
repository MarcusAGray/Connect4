import { createBoard, 
         addPlayerEventListeners, 
         removePlayerEventListeners} from "./board.js";

      
//SOUNDS
let playerWinsSound = new Audio('./sounds/player_win.wav');
let losingSound = new Audio('./sounds/losing.wav');
let playerSetSpaceSound = new Audio('./sounds/set_space2.wav');
let opponentSetSpaceSound = new Audio('./sounds/set_space1.wav');
let startGameSound = new Audio('./sounds/startGame.wav');



const main = document.querySelector(".playing-area")
const turnDisplay = document.getElementById('turn')
const playerScoreDisplay = document.getElementById('player-score')
const opponentScoreDisplay = document.getElementById('opponent-score')

let playerScore = 0
let opponentScore = 0

const boardEl = createBoard(main);
let boardArr
let playersTurn = true
let isPlayerPrevWinner

const MAX_COL_INDEX = 6
const MAX_ROW_INDEX = 5
const COMPUTER_PAUSE_TIME = 1000

let singlePlayerBtn = document.getElementById('single-btn')
let multPlayerBtn = document.getElementById('multi-btn')
singlePlayerBtn.addEventListener('click', startSinglePlayerGame)
multPlayerBtn.addEventListener('click', startMultiplayerGame)

const mainContainer = document.querySelector('.main-container')
let menu = document.querySelector('.menu')
const menuPara = document.getElementById('menuText')

let quitBtn = document.getElementById('quit-btn')
quitBtn.addEventListener('click', () => quit('playerQuit'))

let canStartGame = true
let lastMove
let secondLastMove

let color = 'red'
let opponentColor = 'yellow'

let currentPlayer = 'user'
let isMultiPlayer = false

let gameOn

const socket = io();
socket.disconnect()


function startSinglePlayerGame() {
  if(isMultiPlayer) {
    isMultiPlayer = false
    socket.disconnect()
  }
  startGame()
}

function startMultiplayerGame() {
  console.log('test1')
  if(isMultiPlayer) return
  console.log('test2')
  menuPara.textContent = 'Waiting for another player to join the server...'
  isMultiPlayer = true
  socket.connect()
  socket.emit('multiplayer')
}

//Game Drivers
function startGame() {
  function setBoard() {
    addPlayerEventListeners(handlePlayersColumnClick)
    boardArr.forEach(space => {
      space.setAttribute('data-status', 'empty')
      space.classList.remove('red', 'yellow', 'darkened', 'highlight', 'flash')
    })
    boardEl.classList.remove('darkened')
  }


  if(!canStartGame) return
  canStartGame = false
  gameOn = true

  menu.style.display = 'none'
  mainContainer.classList.remove('blurred')

  startGameSound.play()

  turnDisplay.textContent = currentPlayer == 'user' ? "Turn: Your Turn": "Turn: Opponent's Turn"

  lastMove = null
  secondLastMove = null
  
  if(isPlayerPrevWinner != null) {
    if(isPlayerPrevWinner) currentPlayer = 'user'
    if(!isPlayerPrevWinner) currentPlayer = 'opponent'
  }

  boardArr = Array.from(document.querySelectorAll('.space'))

  setBoard()
  boardEl.classList.add('shift')
  if (!isMultiPlayer && !playersTurn) setTimeout(computerTurn, COMPUTER_PAUSE_TIME)
}

function endTurn() {
  function isNoMoreMovesAvailable() {
    return !(boardArr.some(space => space.getAttribute('data-status') == 'empty'))
  }

  if(isConnectFour()) {
    isMultiPlayer ? socket.emit('game-over', color) : gameOver()
  }
  else if(isNoMoreMovesAvailable()) {    
    isMultiPlayer ? socket.emit('game-over', 'tie') : gameOver('tie')
  }
  else {
    isMultiPlayer ? socket.emit('switch') : switchTurn()
  }
}

function switchTurn() {
  playersTurn = !playersTurn
  currentPlayer = (currentPlayer == 'user') ? 'opponent' : 'user'
  if(!isMultiPlayer) {
    let temp = color
    color = opponentColor
    opponentColor = temp
  }
  turnDisplay.textContent = currentPlayer == 'user' ? "Turn: Your Turn": "Turn: Opponent's Turn"
  if (!isMultiPlayer && !playersTurn) setTimeout(computerTurn, COMPUTER_PAUSE_TIME)
}

function gameOver(winner) {
  canStartGame = true

  removePlayerEventListeners()

  if(winner == 'tie') {
    losingSound.play();
    turnDisplay.textContent = "Tie! No more moves!"
    return
  }

  if (currentPlayer == 'user') {
    playerWinsSound.play();
    playerScore += 1
    playerScoreDisplay.textContent = playerScore
    isPlayerPrevWinner = true
  }

  if (currentPlayer == 'opponent') {
    losingSound.play();
    opponentScore += 1
    opponentScoreDisplay.textContent = opponentScore
    isPlayerPrevWinner = false
  }

  turnDisplay.textContent = `${currentPlayer == 'user' ? "You Win!" : "You Lose"}`
  setTimeout(() => startGame(), 3000)
}

function quit(reason) {
  
  boardEl.classList.remove('shift')
  mainContainer.classList.add('blurred')
  playerScore = 0
  opponentScore = 0

  playerScoreDisplay.textContent = playerScore
  opponentScoreDisplay.textContent = opponentScore
  
  playersTurn = true
  
  isPlayerPrevWinner = null
  
  canStartGame = true
  gameOn = false
  lastMove = null
  secondLastMove = null
  color = 'red'
  opponentColor = 'yellow'
  currentPlayer = 'user'

  boardArr.forEach(space => {
    space.setAttribute('data-status', 'empty')
    space.classList.remove('red', 'yellow', 'highlight', 'flash')
    space.classList.add('darkened')
  })

  removePlayerEventListeners()

  menu.style.display = 'block'

  if(!isMultiPlayer) {
    menuPara.textContent = "You quit the game"
  }
  
  if(isMultiPlayer && reason == 'playerQuit') {
    socket.emit('quit')
    menuPara.textContent = "You quit the game"
  }

  if(isMultiPlayer && reason == 'opponentQuit'){
    menuPara.textContent = "Your opponent has left the game"
  }

  if(reason == 'timeout'){
    menuText.textContent = 'You have reached the 20 minute time limit'
  }

  if (isMultiPlayer) {
    isMultiPlayer = false
  } 
  socket.disconnect()
}



//PLAYER TURN
function handlePlayersColumnClick(columnId) {
  if(!playersTurn) return
  let availableSpace = getLowestEmptyColumnSpace(columnId)
  //if column is already full player needs to choose another column
  if (availableSpace == null) return
  const [cID, rID] = getSpacePosition(availableSpace) 
  if(isMultiPlayer) socket.emit('move', cID, rID, color)
  setSpace([cID, rID], color)
  endTurn()
}


//SOCKETS
socket.on('player-number', index => {
  if (index === -1) {
    menuText.textContent = "Sorry, the server is full."
    isMultiPlayer = false
    socket.disconnect()
  } else {

    let connectionIndex = parseInt(index)
    if(connectionIndex == 1) {
      currentPlayer = "opponent"
      playersTurn = false
      color = 'yellow'
      opponentColor = 'red'
    }
    turnDisplay.textContent = currentPlayer == 'user' ? "Turn: Your Turn": "Turn: Opponent's Turn"
    // Get other player status
    socket.emit('check-players')
  }
})

socket.on('ready', () => {
  startGame()
})

socket.on("move", (cID, rID, color) => {
  setSpace([cID, rID], color)
});

socket.on("switch", () => {
  switchTurn()
});

socket.on("game-over", (winner) => {
  gameOver(winner)
})

socket.on("reveal-win", (winPositions) => {
  revealWin(winPositions)
})

socket.on('quit', () => {
  quit('opponentQuit')
})

socket.on('timeout', () => {
  if(isMultiPlayer) isMultiPlayer = false
  if(gameOn) {
    quit('timeout')
  } else {
    menuText.textContent = 'You have reached the 20 minute time limit'
  }
})

//UTILS
function getSpace(columnId, rowId) {
  return boardArr.find(space => {
    return space.getAttribute('data-column') == columnId &&
           space.getAttribute('data-row') == rowId
  })
}

function setSpace(pos, targetColor){
  function updateMoves(){
    secondLastMove = lastMove
    lastMove = space
  }
  const [cID, rID] = pos
  let space = getSpace(cID, rID)
  space.setAttribute('data-status', targetColor)
  space.classList.add(targetColor, 'flash')

  updateMoves()
  currentPlayer == 'user' ? playerSetSpaceSound.play() : opponentSetSpaceSound.play()
}

function getSpacePosition(space) {
  let row = parseInt(space.getAttribute('data-row'))
  let column = parseInt(space.getAttribute('data-column'))
  return [column, row]
}

function getLowestEmptyColumnSpace(columnId) {
  let availableSpace = boardArr.find(space => {
    return (space.getAttribute('data-column') == columnId &&
            space.getAttribute('data-status') == 'empty')
  })
  return (typeof availableSpace != 'undefined') ? availableSpace : null
}



//GET CONNECTS
function getVerticalConnectOf(num, targetColor) {
  let [column, row] = getSpacePosition(lastMove)

  let nextSpace = lastMove
  const checkedSpaces = []

  while (row >=0 && nextSpace.getAttribute('data-status') == targetColor) {
    checkedSpaces.push(nextSpace)
    row -= 1;
    nextSpace = getSpace(column, row)
  }
  return checkedSpaces.length >= num ? checkedSpaces : null
}

function getHorizontalConnectOf(num, targetColor) {
    
  let nextSpace = lastMove
  let startingSpace = lastMove
  const checkedSpaces = []
  let row
  let column 
  
  [column, row] = getSpacePosition(startingSpace)

  while (column >= 0 && nextSpace.getAttribute('data-status') == targetColor) {
    checkedSpaces.push(nextSpace)
    column -= 1;
    nextSpace = getSpace(column, row)
  }

  [column, row] = getSpacePosition(startingSpace)
  column += 1
  nextSpace = getSpace(column, row)
  
  while (column <= MAX_COL_INDEX && nextSpace.getAttribute('data-status') == targetColor) {
    checkedSpaces.push(nextSpace)
    column += 1;
    nextSpace = getSpace(column, row)
  }

  
  checkedSpaces.sort((a, b) => {
    return a.getAttribute('data-column') - b.getAttribute('data-column')
  })

  return checkedSpaces.length >= num ? checkedSpaces : null

}

function getTopLeftBottomRightConnectOf(num, targetColor) {
  let nextSpace = lastMove
  let startingSpace = lastMove
  const checkedSpaces = []
  let row
  let column

  [column, row] = getSpacePosition(startingSpace)
  
  while ((column >= 0) && (row <= MAX_ROW_INDEX) && (nextSpace.getAttribute('data-status') == targetColor)) {
    checkedSpaces.push(nextSpace)
    column -= 1
    row += 1
    nextSpace = getSpace(column, row)
  }

  [column, row] = getSpacePosition(startingSpace)
  row -= 1
  column += 1
  nextSpace = getSpace(column, row)
  
  while (column <= MAX_COL_INDEX && row >= 0 && nextSpace.getAttribute('data-status') == targetColor) {
    checkedSpaces.push(nextSpace)
    column += 1
    row -= 1
    nextSpace = getSpace(column, row)
  }

  return checkedSpaces.length >= num ? checkedSpaces : null

}

function getBottomLeftTopRightConnectOf(num, targetColor) {
  let nextSpace = lastMove
  let startingSpace = lastMove
  const checkedSpaces = []
  let row
  let column

  [column, row] = getSpacePosition(startingSpace)
  
  while ((column >= 0) && (row >= 0) && (nextSpace.getAttribute('data-status') == targetColor)) {
    checkedSpaces.push(nextSpace)
    column -= 1
    row -= 1
    nextSpace = getSpace(column, row)
  }

  [column, row] = getSpacePosition(startingSpace)
  row += 1
  column += 1
  nextSpace = getSpace(column, row)
  
  while (column <= MAX_COL_INDEX && row <= MAX_ROW_INDEX && nextSpace.getAttribute('data-status') == targetColor) {
    checkedSpaces.push(nextSpace)
    column += 1
    row += 1
    nextSpace = getSpace(column, row)
  }

  return checkedSpaces.length >= num ? checkedSpaces : null
}


//CHECK FOR WIN
function isConnectFour() {  
  const vWin = getVerticalConnectOf(4, color)
  const hWin = getHorizontalConnectOf(4, color)
  const diag1Win = getTopLeftBottomRightConnectOf(4, color)
  const diag2Win = getBottomLeftTopRightConnectOf(4, color)

  if(vWin || hWin || diag1Win || diag2Win) {
   
    let winningSpaces 
    if(vWin) winningSpaces = vWin
    if(hWin) winningSpaces = hWin
    if(diag1Win) winningSpaces = diag1Win
    if(diag2Win) winningSpaces = diag2Win

    let winPositions = winningSpaces.map(space => {
      return [space.getAttribute('data-column'), space.getAttribute('data-row')]
    })

    revealWin(winPositions)
    if(isMultiPlayer) socket.emit('reveal-win', winPositions)
    return true
  }

  return false
}

function revealWin(winPositions) {
  boardArr.forEach(space => {
    space.classList.remove('flash')
    space.classList.add('darkened')
  })

  const winningSpaces = winPositions.map(pos => getSpace(pos[0], pos[1]))
  winningSpaces.forEach(space => space.classList.remove('darkened'))
  winningSpaces.forEach(space => space.classList.add('highlight', 'flash'))
}



//COMPUTER TURN AND MOVE CALCULATOR
function computerTurn() {
  let winMove
  let preventativeMove
  let randomMove

  if(lastMove != null) {
    winMove = getWinningMove()
    if (lastMove != null && winMove) setSpace(getSpacePosition(winMove), color)
    
    if(lastMove != null && !winMove) {
      preventativeMove = getPreventLossMove()
      if(preventativeMove) setSpace(getSpacePosition(preventativeMove), color)
    }
  }

  if(!winMove && !preventativeMove) {
    do {
      const randColumnId = Math.floor(Math.random() * MAX_COL_INDEX + 1)
      randomMove = getLowestEmptyColumnSpace(randColumnId)
    } while (randomMove == null)
    setSpace(getSpacePosition(randomMove), color)  
  }
  endTurn()
}

function getWinningMove() {
  if(secondLastMove == null) return null

  function getWinningVertical() {
    let [column, row] = getSpacePosition(secondLastMove)
    let nextSpace = secondLastMove
    const checkedSpaces = []
    
    if(row == MAX_ROW_INDEX || 
      getSpace(column, row + 1).getAttribute('data-status') != 'empty') return null

    do {
      checkedSpaces.push(nextSpace)
      row -= 1;
      nextSpace = getSpace(column, row)
    } while (row >=0 && nextSpace.getAttribute('data-status') == color)
  
    return (checkedSpaces.length >= 3) ? checkedSpaces : null
  }

  function getWinningHorizontal() {
    let initialSpace = secondLastMove
    let row 
    let column 
    
    [column, row] = getSpacePosition(initialSpace)
    
    let nextSpace = secondLastMove
    const checkedSpaces = []

    do{
      checkedSpaces.push(nextSpace)
      column -= 1;
      nextSpace = getSpace(column, row)
    } while (column >= 0 && nextSpace.getAttribute('data-status') == color)

    [column, row] = getSpacePosition(initialSpace)
    column += 1
    nextSpace = getSpace(column, row)
    
    while (column <= MAX_COL_INDEX && nextSpace.getAttribute('data-status') == color) {
      checkedSpaces.push(nextSpace)
      column += 1;
      nextSpace = getSpace(column, row)
    }

    checkedSpaces.sort((a, b) => {
      return a.getAttribute('data-column') - b.getAttribute('data-column')
    })
    return (checkedSpaces.length >= 3) ? checkedSpaces : null
  }

  // let connectWin
  let vConnectWin = getWinningVertical()
  if(vConnectWin != null) {
    let [nextMoveCol, nextMoveRow] = getSpacePosition(secondLastMove)
    nextMoveRow += 1
    return getSpace(nextMoveCol, nextMoveRow)
  }

  let hConnectWin = getWinningHorizontal()
  if(hConnectWin != null) {
    let sideSpaces = getViableSideSpaces(hConnectWin)
    if (sideSpaces != null && sideSpaces.length == 2) return sideSpaces[Math.floor(Math.random() * 2)]
    if (sideSpaces != null && sideSpaces.length == 1) return sideSpaces[0]
  }
  return null
}

function getPreventLossMove() {
  let latestOpponentMove = lastMove
  let sideSpaces = []

  //prevent simple vertical win
  let verticalThree = getVerticalConnectOf(3, opponentColor)
  if(verticalThree) {
    let [nextMoveCol, nextMoveRow] = getSpacePosition(latestOpponentMove)
    nextMoveRow += 1
    return getSpace(nextMoveCol, nextMoveRow)
  }
  
  //prevent simple horizontal win
  let horizontalThree = getHorizontalConnectOf(3, opponentColor)
  if(horizontalThree) {
    sideSpaces = getViableSideSpaces(horizontalThree)
    if (sideSpaces != null && sideSpaces.length == 2) {
      return sideSpaces[Math.floor(Math.random() * 2)]
    }
    if (sideSpaces != null && sideSpaces.length == 1) return sideSpaces[0]
  }

  //prevent horizontal two either side empty win
  let horizontalTwo = getHorizontalConnectOf(2, opponentColor)
  if(horizontalTwo) {
    sideSpaces = getViableSideSpaces(horizontalTwo)
    if (sideSpaces != null && sideSpaces.length == 2) {
      return sideSpaces[Math.floor(Math.random() * 2)]
    }
  }

  return null
}

function getViableSideSpaces(hArray) {
  /* a potential space has to 1.exist and 2.be a possible target for opponents next move
   (as a token can only be placed at the lowest empty space in any column) */

  function getViableSpaceOnLeft(hArray) {
    const hRow = hArray[0].getAttribute('data-row')
    let leftMostSpace = hArray[0]
    if(leftMostSpace.getAttribute('data-column') == 0) return false
  
    let leftColumn = parseInt(leftMostSpace.getAttribute('data-column')) - 1
    let space = getSpace(leftColumn, hRow)

    if(space.isEqualNode(getLowestEmptyColumnSpace(leftColumn))) {
      return getSpace(leftColumn, hRow)
    }
    return null
  }

  function getViableSpaceOnRight(hArray) {
    const hRow = hArray[0].getAttribute('data-row')
    let rightMostSpace = hArray[hArray.length - 1]
    if(rightMostSpace.getAttribute('data-column') == MAX_COL_INDEX) return false
  
    let rightColumn = parseInt(rightMostSpace.getAttribute('data-column')) + 1
    let space = getSpace(rightColumn, hRow)

    if(space.isEqualNode(getLowestEmptyColumnSpace(rightColumn))) {
      return getSpace(rightColumn, hRow)
    }
    return null
  }

  let leftSpace = getViableSpaceOnLeft(hArray)
  let rightSpace = getViableSpaceOnRight(hArray)
  const sideSpaces = []
  if (leftSpace != null) sideSpaces.push(leftSpace)
  if (rightSpace != null) sideSpaces.push(rightSpace)
  return sideSpaces.length > 0 ? sideSpaces : null
}




