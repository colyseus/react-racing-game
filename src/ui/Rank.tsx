import { useEffect, useState } from 'react'
import type { Player } from '../../server/src/rooms/schema/MyRoomState'
import { gameRoom } from '../network/api'

type Score = {
  rank: number
  time: string | number
  playerId: string
}

export function Rank(): JSX.Element {
  const [scores, setScores] = useState([] as Score[])
  useEffect(() => {
    setTimeout(() => {
      const sortedPlayers = [...gameRoom.state.players.values()].sort((a: Player, b: Player) => a.etc - b.etc)
      const _scores: Score[] = []
      for (const index in sortedPlayers) {
        _scores.push({
          rank: Number(index) + 1,
          time: sortedPlayers[index].etc < 100000 ? sortedPlayers[index].etc : '-',
          playerId: sortedPlayers[index].sessionId ? sortedPlayers[index].sessionId : '',
        })
      }
      setScores(_scores)
    }, 1500)
  }, [scores])

  return (
    <>
      <div className="rank">
        <div className="popup-content">
          <div className="mainPlayerInfo">Your Player ID: {gameRoom.sessionId}</div>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>ETC</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => {
                return (
                  <tr className={score.playerId === gameRoom.sessionId ? 'mainPlayer' : ''} key={score.rank}>
                    <td>{score.rank}</td>
                    <td>{score.playerId}</td>
                    <td>{typeof score.time == 'number' ? score.time.toFixed(2) : score.time}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
