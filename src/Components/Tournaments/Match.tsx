import { ReactNode, useEffect, useState } from 'react';
import { usePlayers } from '../../Contexts/PlayersContext';
import { BracketMatch, BracketPlayer, Player } from '../../Types/dataTypes';
import { getFlag } from '../../Utils/playerUtils';

interface MatchProps {
    match: BracketMatch;
}
const Match: React.FC<MatchProps> = ({ match }) => {
    const { getPlayerById } = usePlayers();

    const getPlayerInfo = async (player: BracketPlayer | 'Bye' | null) => {
        if (!player || player === 'Bye') {
            return player;
        }

        const playerInfo: Player | null = getPlayerById(player.playerId);

        if (!playerInfo) return null;

        const flag = await getFlag(playerInfo);
        const { firstName, lastName } = playerInfo;

        return (
            <>
                {flag && (
                    <img src={flag} alt={`${playerInfo.country} flag`} className="player-flag" />
                )}
                {`${firstName[0]}. ${lastName}`}{' '}
                <span className="player-seed">({player.seed})</span>
            </>
        );
    };

    const [player1Info, setPlayer1Info] = useState<ReactNode | null>(null);
    const [player2Info, setPlayer2Info] = useState<ReactNode | null>(null);

    useEffect(() => {
        getPlayerInfo(match.player1).then(setPlayer1Info);
        getPlayerInfo(match.player2).then(setPlayer2Info);
    }, [match]);

    return (
        <div className="match">
            <span className="player top-player">{player1Info}</span>
            <span className="player">{player2Info}</span>
        </div>
    );
};

export default Match;
