const main = document.querySelector(".main-playing-area")
const playerTurnDisplay = document.getElementById("player-turn-display")
const infoDisplay = document.getElementById("display")

playerTurnDisplay.textContent = 'red'
const boardArr = []
let playerTurn = true
let gameOn = false

function startGame() {
  gameOn = true
  const board = document.createElement('div')
  board.classList.add('board')

  //create array of arrays
  for(let m = 0; m < 7; m++) {
    boardArr.push([])
  }

  for (let j = 0; j < 7; j++) {
    const column = document.createElement('div')
    column.setAttribute('id', `c${j}`)
    column.classList.add('column')
    
    const columnArray = boardArr[j]
    column.addEventListener('click', () => handleColumnClick(columnArray))
    
    //create rows
    for (let i = 5; i >= 0; i--) {
      let square = document.createElement('div')
      square.classList.add('square')
      square.setAttribute('data-status', 'empty')
      square.setAttribute('id', `c${j}r${i}`)

      square.setAttribute('data-column', j)
      square.setAttribute('data-row', i)

      // square.textContent = square.getAttribute('id')
      column.appendChild(square)
      boardArr[j].unshift(square)
    }
    board.appendChild(column)
  }

  main.appendChild(board)
}

function handleColumnClick(columnArray) {
  const playerColor = playerTurn ? 'red' : 'yellow'
  let lowestSquare = columnArray.find(e => 
  e.getAttribute('data-status') == 'empty'
  )

  if (typeof lowestSquare == "undefined") return
   
  lowestSquare.setAttribute('data-status', playerColor)
  lowestSquare.classList.add(playerColor)

  isConnectFour(playerColor, lowestSquare)
  if(gameOn) switchTurns()
}

function switchTurns() {

 playerTurn = !playerTurn;
  playerTurnDisplay.textContent =playerTurn ? 'red' : 'yellow'
  if (!playerTurn) {
    setTimeout(computerTurn, 1000)
    
  }
}

function computerTurn() {
  console.log("computer turn")
  //choose random column
  //place color if space in column

  const playerColor = playerTurn ? 'red' : 'yellow'
  
  let lowestSquare

  while (typeof lowestSquare == 'undefined') {
    console.log("loop")
    const rand = Math.floor(Math.random() * 7)
    let columnArray = boardArr[rand]
    lowestSquare = columnArray.find(e => 
      e.getAttribute('data-status') == 'empty'
    )
  }
 
  lowestSquare.setAttribute('data-status', playerColor)
  lowestSquare.classList.add(playerColor)

  isConnectFour(playerColor, lowestSquare)
  if(gameOn) switchTurns()
}

function isConnectFour(playerColor, playedSquare) {
  
  const arr = boardArr.flat()
  
  function hasVerticalWin() {
    for (let i = 0; i < 7; i++) {
  
      const vertical = arr.map(element => {
        if (element.getAttribute('data-column') == i &&
            element.getAttribute('data-status') == playerColor) {
          return element.getAttribute('data-row')
        }  
      }).filter(e => e !== undefined)
     
      if (vertical.length >=4 && isConsecutive(vertical)) return true
    }
  }

  function hasHorizontalWin() {
    for (let j = 0; j < 6; j++) {
    
      const horizontal = arr.map(element => {
          if (element.getAttribute('data-row') == j &&
              element.getAttribute('data-status') == playerColor) {
        return element.getAttribute('data-column')
      }  
    }).filter(e => e !== undefined)
  
    if (horizontal.length >=4 && isConsecutive(horizontal)) return true
    }
  }

  function hasDiagonalWin() {
    let playedColumn = playedSquare.getAttribute('data-column')
    let playedRow = playedSquare.getAttribute('data-row')
  
    let col = parseInt(playedColumn)
    let row = parseInt(playedRow)
    let keepLooking = true
    diagonalLength = 1
  
    //check top left digonal
    while(col >= 0 && row < 6 && keepLooking && diagonalLength < 4) {
      
      if(col == playedColumn && row == playedRow) {
        col -= 1
        row += 1
        continue
      }
      
      leftUpDiagonalSquare = arr.find(e => 
        (parseInt(e.getAttribute('data-column')) == col) &&
        (parseInt(e.getAttribute('data-row')) == row)
      )
  
      if(leftUpDiagonalSquare.getAttribute('data-status') == playerColor){
        diagonalLength += 1
      }else {
        keepLooking = !keepLooking
      }
        
      col -= 1
      row += 1
    }
  
    col = parseInt(playedColumn)
    row = parseInt(playedRow)
    keepLooking = true
  
    //check bottom right
    while(col < 7 && row >= 0 && keepLooking && diagonalLength < 4) {
      
      if(col == playedColumn && row == playedRow) {
        col += 1
        row -= 1
        continue
      }
      
      rightDownDiagonalSquare = arr.find(e => 
        (parseInt(e.getAttribute('data-column')) == col) &&
        (parseInt(e.getAttribute('data-row')) == row)
      )
  
      if(rightDownDiagonalSquare.getAttribute('data-status') == playerColor){
        diagonalLength += 1
      }else {
        keepLooking = !keepLooking
      }
        
      col += 1
      row -= 1
    }
  
  
    if(diagonalLength == 4) return true
      
  
    //Now for the other diagonal check
  
    col = parseInt(playedColumn)
    row = parseInt(playedRow)
    keepLooking = true
    diagonalLength = 1
  
    //check bottom left
    while(col >= 0 && row >= 0 && keepLooking && diagonalLength < 4) {
      
      if(col == playedColumn && row == playedRow) {
        col -= 1
        row -= 1
        continue
      }
      
      leftDownDiagonalSquare = arr.find(e => 
        (parseInt(e.getAttribute('data-column')) == col) &&
        (parseInt(e.getAttribute('data-row')) == row)
      )
  
      if(leftDownDiagonalSquare.getAttribute('data-status') == playerColor){
        diagonalLength += 1
      }else {
        keepLooking = !keepLooking
      }
        
      col -= 1
      row -= 1
    }
  
  
    col = parseInt(playedColumn)
    row = parseInt(playedRow)
    keepLooking = true
  
    //check top right
    while(col < 7 && row < 6 && keepLooking && diagonalLength < 4) {
      
      if(col == playedColumn && row == playedRow) {
        col += 1
        row += 1
        continue
      }
      
      leftUpDiagonalSquare = arr.find(e => 
        (parseInt(e.getAttribute('data-column')) == col) &&
        (parseInt(e.getAttribute('data-row')) == row)
      )
  
      if(leftUpDiagonalSquare.getAttribute('data-status') == playerColor){
        diagonalLength += 1
      }else {
        keepLooking = !keepLooking
      }
        
      col += 1
      row += 1
    }
  
    if(diagonalLength == 4) return true
  }


  if( hasVerticalWin(playerColor) || 
      hasHorizontalWin(playerColor) || 
      hasDiagonalWin(playerColor, playedSquare)) {
        gameOver(playerColor)
  }
}

function isConsecutive(array) {
  array.sort((a, b) => a - b) //may not be needed

  if (array.length > 4) {
    return isConsecutive(array.slice(1)) || isConsecutive(array.slice(-1))
  } 

  // max – min + 1 = n where max is the maximum element in the array, min is the minimum element in the array and n is the number of elements in the array. 
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i+1] - array[i] != 1) return false
  }
  return true
}


function gameOver(playerColor) {
  gameOn = false
  infoDisplay.textContent = `${playerColor == 'red' ? "Red" : "Yellow"} Wins!`
}


startGame()












