import {useStore} from "../store";
import {Keys} from "./Keys";
import {gameRoom, getPlayers, mainPlayerId} from "../network";
import {useEffect, useState} from "react";
import {Player} from "../GameRoomState";
import * as stream from "stream";

type Score = {
    rank: number
    time: string
    playerId: string
}

export function Rank(): JSX.Element {
    const [scores, setScores] = useState([] as Score[])
    useEffect(() => {
        setTimeout(() => {
            const sortedPlayers = [...getPlayers().values()].sort((a: Player, b: Player) => a.completedTime - b.completedTime )
            const _scores: Score[] = []
            for(const index in sortedPlayers) {
                _scores.push({
                    rank: Number(index) + 1,
                    playerId: sortedPlayers[index].sessionId? sortedPlayers[index].sessionId: '',
                    time: sortedPlayers[index].completedTime < 100000? sortedPlayers[index].completedTime: '-'
                })
            }
            setScores(_scores)
        }, 1500)
    }, [scores])

    return (
        <>
            <div className="rank">
                <div className="popup-content">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>ETC</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                scores.map(score => {
                                    return <tr className={score.playerId === gameRoom.sessionId? 'mainPlayer': ''} key={score.rank}>
                                        <td>{score.rank}</td>
                                        <td>{score.playerId}</td>
                                        <td>{score.time}</td>
                                    </tr>
                                })
                            }
                            </tbody>
                        </table>

                </div>
            </div>
        </>
    )
}
