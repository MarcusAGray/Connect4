import { createBoard, 
         addPlayerEventListeners, 
         removePlayerEventListeners} from "./board.js";

const main = document.querySelector(".playing-area")
const playerTurnDisplay = document.getElementById("player-turn-display")
const infoDisplay = document.getElementById("game-info-display")
const playerScoreDisplay = document.getElementById('player-score')
const computerScoreDisplay = document.getElementById('computer-score')
const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', startGame)
const turnDisplay = document.getElementById('turn-display')
const turnValueDisplay = document.getElementById('turn-value-display')
const winnerDisplay = document.getElementById('winner-display')

let playerScore = 0
let computerScore = 0

const boardEl = createBoard(main);
let boardArr
let playersTurn = true
let isPlayerPrevWinner

const MAX_COL_INDEX = 6
const MAX_ROW_INDEX = 5
const COMPUTER_PAUSE_TIME = 1000

let canStartGame = true
let lastMove
let secondLastMove

let playerColor = 'red'
let computerColor = 'yellow'

let playerWinsSound = new Audio('./sounds/player_win.wav');
let losingSound = new Audio('./sounds/losing.wav');
let playerSetSpaceSound = new Audio('./sounds/set_space2.wav');
let computerSetSpaceSound = new Audio('./sounds/set_space1.wav');
let startGameSound = new Audio('./sounds/startGame.wav');

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

  playBtn.textContent = 'Game on!'
  startGameSound.play()
  turnDisplay.classList.remove('hidden')
  winnerDisplay.classList.add('hidden')
  turnValueDisplay.textContent = playersTurn ? playerColor : computerColor 
  toggleTurnTextColor()

  lastMove = null
  secondLastMove = null
  playersTurn = isPlayerPrevWinner != null ? isPlayerPrevWinner : true 

  turnDisplay.classList.remove('invisible')

  boardArr = Array.from(document.querySelectorAll('.space'))

  setBoard()
  if (!playersTurn) setTimeout(computerTurn, COMPUTER_PAUSE_TIME)
}

function endTurn() {
  function isNoMoreMovesAvailable() {
    return !(boardArr.some(space => space.getAttribute('data-status') == 'empty'))
  }
  let color = playersTurn ? playerColor: computerColor
  if(isConnectFour()) gameOver(color) 
  else if(isNoMoreMovesAvailable()) gameOver('tie')
  else switchTurn()
}

function switchTurn() {
  playersTurn = !playersTurn
  turnValueDisplay.textContent = playersTurn ? playerColor : computerColor
  toggleTurnTextColor()
  if (!playersTurn) setTimeout(computerTurn, COMPUTER_PAUSE_TIME)
}

function gameOver(winner) {

  canStartGame = true
  
  playBtn.textContent = "Play again"
  turnDisplay.classList.add('hidden')
  winnerDisplay.classList.remove('hidden')
  winnerDisplay.textContent = `${winner} wins!`

  removePlayerEventListeners()

  if(winner == 'tie') {
    losingSound.play();
    infoDisplay.textContent = "Tie! No more moves!"
    return
  }

  if (winner == 'red') {
    playerWinsSound.play();
    playerScore += 1
    playerScoreDisplay.textContent = playerScore
    isPlayerPrevWinner = true
  }

  if (winner == 'yellow') {
    losingSound.play();
    computerScore += 1
    computerScoreDisplay.textContent = computerScore
    isPlayerPrevWinner = false
  }

  infoDisplay.textContent = `${winner == "red" ? "Red" : "Yellow"} Wins!`
}





//PLAYER TURN
function handlePlayersColumnClick(columnId) {
  if(!playersTurn) return
  let availableSpace = getLowestEmptyColumnSpace(columnId)
  
  //if column is already full player needs to choose another column
  if (availableSpace == null) return
  setSpace(availableSpace, playerColor)
  endTurn()
}




//COMPUTER TURN AND MOVE CALCULATOR
function computerTurn() {
  let winMove
  let preventativeMove
  let randomMove

  if(lastMove != null) {
    winMove = getWinningMove()
    if (lastMove != null && winMove) setSpace(winMove, computerColor)
    
    if(lastMove != null && !winMove) {
      preventativeMove = getPreventLossMove()
      if(preventativeMove) setSpace(preventativeMove, computerColor)
    }
  }

  if(!winMove && !preventativeMove) {
    do {
      const randColumnId = Math.floor(Math.random() * MAX_COL_INDEX + 1)
      randomMove = getLowestEmptyColumnSpace(randColumnId)
    } while (randomMove == null)
    setSpace(randomMove, computerColor)  
  }
  endTurn()
}

function getWinningMove() {
  if(secondLastMove == null) return null

  function getWinningVertical() {
    let [row, column] = getSpacePosition(secondLastMove)
    let nextSpace = secondLastMove
    const checkedSpaces = []
    
    if(row == MAX_ROW_INDEX || 
      getSpace(column, row + 1).getAttribute('data-status') != 'empty') return null

    do {
      checkedSpaces.push(nextSpace)
      row -= 1;
      nextSpace = getSpace(column, row)
    } while (row >=0 && nextSpace.getAttribute('data-status') == computerColor)
  
    return (checkedSpaces.length >= 3) ? checkedSpaces : null
  }

  function getWinningHorizontal() {
    let initialSpace = secondLastMove
    let row 
    let column 
    
    [row, column] = getSpacePosition(initialSpace)
    
    let nextSpace = secondLastMove
    const checkedSpaces = []

    do{
      checkedSpaces.push(nextSpace)
      column -= 1;
      nextSpace = getSpace(column, row)
    } while (column >= 0 && nextSpace.getAttribute('data-status') == computerColor)

    [row, column] = getSpacePosition(initialSpace)
    column += 1
    nextSpace = getSpace(column, row)
    
    while (column <= MAX_COL_INDEX && nextSpace.getAttribute('data-status') == computerColor) {
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
    let [nextMoveRow, nextMoveCol] = getSpacePosition(secondLastMove)
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
  let verticalThree = getVerticalConnectOf(3, playerColor)
  if(verticalThree) {
    let [nextMoveRow, nextMoveCol] = getSpacePosition(latestOpponentMove)
    nextMoveRow += 1
    return getSpace(nextMoveCol, nextMoveRow)
  }
  
  //prevent simple horizontal win
  let horizontalThree = getHorizontalConnectOf(3, playerColor)
  if(horizontalThree) {
    sideSpaces = getViableSideSpaces(horizontalThree)
    if (sideSpaces != null && sideSpaces.length == 2) {
      return sideSpaces[Math.floor(Math.random() * 2)]
    }
    if (sideSpaces != null && sideSpaces.length == 1) return sideSpaces[0]
  }

  //prevent horizontal two either side empty win
  let horizontalTwo = getHorizontalConnectOf(2, playerColor)
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




//Utils
function getSpace(columnId, rowId) {
  return boardArr.find(space => {
    return space.getAttribute('data-column') == columnId &&
           space.getAttribute('data-row') == rowId
  })
}

function setSpace(space, color){
  function updateMoves(){
    secondLastMove = lastMove
    lastMove = space
  }
  space.setAttribute('data-status', color)
  space.classList.add(color, 'flash')

  updateMoves()
  color == playerColor ? playerSetSpaceSound.play() : computerSetSpaceSound.play()
}

function getSpacePosition(space) {
  let row = parseInt(space.getAttribute('data-row'))
  let column = parseInt(space.getAttribute('data-column'))
  return [row, column]
}

function getLowestEmptyColumnSpace(columnId) {
  let availableSpace = boardArr.find(space => {
    return (space.getAttribute('data-column') == columnId &&
            space.getAttribute('data-status') == 'empty')
  })
  return (typeof availableSpace != 'undefined') ? availableSpace : null
}

function toggleTurnTextColor() {
  turnValueDisplay.classList.remove('red-text', 'yellow-text')
  if (playersTurn) {
    turnValueDisplay.classList.add('red-text')
  } else {
    turnValueDisplay.classList.add('yellow-text')
  }
}



//GET CONNECTS
function getVerticalConnectOf(num, color) {
  let [row, column] = getSpacePosition(lastMove)

  let nextSpace = lastMove
  const checkedSpaces = []

  while (row >=0 && nextSpace.getAttribute('data-status') == color) {
    checkedSpaces.push(nextSpace)
    row -= 1;
    nextSpace = getSpace(column, row)
  }

  return checkedSpaces.length >= num ? checkedSpaces : null
}

function getHorizontalConnectOf(num, color) {
    
  let nextSpace = lastMove
  let startingSpace = lastMove
  const checkedSpaces = []
  let row
  let column 
  
  [row, column] = getSpacePosition(startingSpace)

  while (column >= 0 && nextSpace.getAttribute('data-status') == color) {
    checkedSpaces.push(nextSpace)
    column -= 1;
    nextSpace = getSpace(column, row)
  }

  [row, column] = getSpacePosition(startingSpace)
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

  return checkedSpaces.length >= num ? checkedSpaces : null

}

function getTopLeftBottomRightConnectOf(num, color) {
  let nextSpace = lastMove
  let startingSpace = lastMove
  const checkedSpaces = []
  let row
  let column

  [row, column] = getSpacePosition(startingSpace)
  
  while ((column >= 0) && (row <= MAX_ROW_INDEX) && (nextSpace.getAttribute('data-status') == color)) {
    checkedSpaces.push(nextSpace)
    column -= 1
    row += 1
    nextSpace = getSpace(column, row)
  }

  [row, column] = getSpacePosition(startingSpace)
  row -= 1
  column += 1
  nextSpace = getSpace(column, row)
  
  while (column <= MAX_COL_INDEX && row >= 0 && nextSpace.getAttribute('data-status') == color) {
    checkedSpaces.push(nextSpace)
    column += 1
    row -= 1
    nextSpace = getSpace(column, row)
  }

  return checkedSpaces.length >= num ? checkedSpaces : null

}

function getBottomLeftTopRightConnectOf(num, color) {
  let nextSpace = lastMove
  let startingSpace = lastMove
  const checkedSpaces = []
  let row
  let column

  [row, column] = getSpacePosition(startingSpace)
  
  while ((column >= 0) && (row >= 0) && (nextSpace.getAttribute('data-status') == color)) {
    checkedSpaces.push(nextSpace)
    column -= 1
    row -= 1
    nextSpace = getSpace(column, row)
  }

  [row, column] = getSpacePosition(startingSpace)
  row += 1
  column += 1
  nextSpace = getSpace(column, row)
  
  while (column <= MAX_COL_INDEX && row <= MAX_ROW_INDEX && nextSpace.getAttribute('data-status') == color) {
    checkedSpaces.push(nextSpace)
    column += 1
    row += 1
    nextSpace = getSpace(column, row)
  }

  return checkedSpaces.length >= num ? checkedSpaces : null
}



//CHECK FOR WIN
function isConnectFour() {

  let color = playersTurn ? 'red' : 'yellow'
  
  const vWin = getVerticalConnectOf(4, color)
  const hWin = getHorizontalConnectOf(4, color)
  const diag1Win = getTopLeftBottomRightConnectOf(4, color)
  const diag2Win = getBottomLeftTopRightConnectOf(4, color)

  if(vWin || hWin || diag1Win || diag2Win) {
      boardArr.forEach(space => {
        space.classList.remove('flash')
        space.classList.add('darkened')
      })
  }

  if(vWin) {
    vWin.forEach(space => space.classList.remove('darkened'))
    vWin.forEach(space => space.classList.add('highlight', 'flash'))
  }
  if(hWin) {
    hWin.forEach(space => space.classList.remove('darkened'))
    hWin.forEach(space => space.classList.add('highlight', 'flash'))
  }
  if(diag1Win) {
    diag1Win.forEach(space => space.classList.remove('darkened'))
    diag1Win.forEach(space => space.classList.add('highlight', 'flash'))
  }
  if(diag2Win) {
    diag2Win.forEach(space => space.classList.remove('darkened'))
    diag2Win.forEach(space => space.classList.add('highlight', 'flash'))
  }

  if(vWin || hWin || diag1Win || diag2Win) return true
  return false
}







//Old function - may be handy if I want to expand project
// function isConsecutive(num, array) {
//   array.sort((a, b) => a - b)

//   if (array.length > num) {
//     return isConsecutive(array.slice(1)) || isConsecutive(array.slice(-1))
//   } 

//   // max – min + 1 = n where max is the maximum element in the array, 
//   //min is the minimum element in the array and n is the number of 
//   //elements in the array. 
//   for (let i = 0; i < array.length - 1; i++) {
//     if (array[i+1] - array[i] != 1) return false
//   }
//   return true
// }