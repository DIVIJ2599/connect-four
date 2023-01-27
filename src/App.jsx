import { useState } from 'react'
import GameBoard from './components/gameboard/GameBoard'
import { gamespots } from './utilities/gamespots'
import { checkWinner } from './utilities/checkWinner'
import { animate, flashWin, flashTop } from './utilities/animations'
import Score from './components/indicators/Score'
import InGameMenu from './components/menus/InGameMenu'
import PauseMenu from './components/menus/PauseMenu'

function App() {
  const [turn, setTurn] = useState('player1')
  const [board, setBoard] = useState(gamespots)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState({ player1: 0, player2: 0 })
  const [pause, setPause] = useState(false)
  const [gameWinner, setGameWinner] = useState(null)
  const [gameCount, setGameCount] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [resetFlag, setResetFlag] = useState(false)

  async function runTurn(spot) {
    if (gameOver) return
    setClickCount(clickCount + 1)
    
    const newBoard = await updateBoard(spot)
    
    animate(spot)
    
    const winnerInfo = checkWinner(newBoard, spot)
    if (winnerInfo[0]) {
      setGameOver(true)
      let winningPlayer = newBoard[spot].value
      setGameWinner(winningPlayer)
      addToScore(winningPlayer)
      await highlightWin(newBoard, winnerInfo[1])
      setGameCount(gameCount + 1)
      flashWin()
      return
    }
    updateTurn()
    if (clickCount >= 41) {
      console.log('stalemate hit')
      return stalemate()
    }
  }

  function outOfTime() {
    setGameOver(true)
    setGameWinner(turn === 'player1' ? 'player2' : 'player1')
    addToScore(turn === 'player1' ? 'player2' : 'player1')
    setGameCount(gameCount + 1)
  }

  function stalemate() {
    setGameOver(true)
    setGameWinner('stalemate')
    setGameCount(gameCount + 1)
  }

  function addToScore(winningPlayer) {
    let newScore = { ...score, [winningPlayer]: score[winningPlayer] += 1 }
    setScore(newScore)
  }

  function updateTurn() {
    turn === 'player1' ? setTurn('player2') : setTurn('player1')
  }

  function highlightWin(board, spots) {

    const winBoard = board.map(each => {   
      if (spots.includes(each.position)) {
        return { ...each, winner: true }
      }

      return each
    })
    setBoard(winBoard)
    return true
  }

  //update the values across the board
  function updateBoard(spot) {
    const newBoard = board.map(each => {

      if (each.position === spot) {
        return { ...each, value: turn }
      }

      return each
    })
    setBoard(newBoard)
    return newBoard
  }

  function resetGame() {
    setBoard(gamespots)
    setTurn('player1')
    setGameOver(false)
    setScore({ player1: 0, player2: 0 })
    setPause(false)
    setClickCount(0)
    setGameWinner(null)
    flashTop()
    setResetFlag(!resetFlag)
  }

  function playAgain() {
    setBoard(gamespots)
    setGameOver(false)
    setGameWinner(null)
    setClickCount(0)

    if (gameCount % 2 === 0) {
      setTurn('player1')
    } else {
      setTurn('player2')
    }
  }

  function quitGame() {
    resetGame()
  }

  return (
    <div className='app'>
          <InGameMenu
            board={board}
            resetGame={resetGame}
            setPause={setPause}
          />
          <Score
            score={score.player1}
            player='Player 1'
            pause={pause} />
          <Score
            score={score.player2}
            player='Player 2'
            pause={pause} />
          <GameBoard
            board={board}
            runTurn={runTurn}
            gameWinner={gameWinner}
            playAgain={playAgain}
            outOfTime={outOfTime}
            turn={turn}
            pause={pause}
            resetFlag={resetFlag}
          />
      {pause ? <PauseMenu setPause={setPause} pause={pause} quit={quitGame} reset={resetGame} /> : null}
    </div>
  )
}

export default App

