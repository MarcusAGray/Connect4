
//PRELIMINARY SETUP
function createBoard(parentEl) {
  const boardEl = document.createElement('div')
  boardEl.classList.add('board')
  const columnsContainer = document.createElement('div')
  columnsContainer.classList.add('columns-container')

  for (let j = 0; j < 7; j++) {

    const column = document.createElement('div')
    column.setAttribute('id', j)
    column.classList.add('column')
        
    //create rows
    for (let i = 0; i <= 5; i++) {
      let spaceContainer = document.createElement('div')
      spaceContainer.classList.add('space-container')

      let space = document.createElement('div')
      space.classList.add('space', 'animated')
      space.setAttribute('data-status', 'empty')
      space.setAttribute('data-column', j)
      space.setAttribute('data-row', i)

      spaceContainer.appendChild(space)
      column.appendChild(spaceContainer)
    }
    columnsContainer.appendChild(column)
  }
  boardEl.appendChild(columnsContainer)
  boardEl.classList.add('darkened')
  parentEl.appendChild(boardEl)
  return boardEl;
}

function addPlayerEventListeners(handlePlayerActionFn) {
  let columns = document.querySelectorAll('.column')
  columns.forEach(col => col.addEventListener('click', () => {
    handlePlayerActionFn(col.getAttribute('id'))
  }))
}
  
function removePlayerEventListeners() {
  let columns = document.querySelectorAll('.column')
  columns.forEach(col =>
    col.replaceWith(col.cloneNode(true))
  )
}




export {createBoard,
        addPlayerEventListeners,
        removePlayerEventListeners};