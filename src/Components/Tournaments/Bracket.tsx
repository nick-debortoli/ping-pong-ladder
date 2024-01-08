import { useEffect } from 'react';
import { BracketMatch, Office, Tournament } from '../../Types/dataTypes';
import { usePlayers } from '../../Contexts/PlayersContext';
import { generateTournamentRounds } from '../../Utils/tournamentUtils';
import { updateTournamentRoundsByName } from '../../database/tournaments';
import './Bracket.scss';

interface BracketProps {
    tournament: Tournament;
    activeOffice: Office;
}

const Bracket: React.FC<BracketProps> = ({ tournament, activeOffice }) => {
    const { getPlayerById } = usePlayers();

    useEffect(() => {
        const updateRounds = async () => {
            const players = tournament.seeds[activeOffice];
            const tournamentRounds = generateTournamentRounds(players);
            console.log(tournamentRounds);

            try {
                await updateTournamentRoundsByName(tournamentRounds, tournament.name, activeOffice);
            } catch (error) {
                console.error('Error updating tournament rounds:', error);
            }
        };

        updateRounds();
    }, [tournament, activeOffice, getPlayerById]);
    const sortedRounds = (
        Object.entries(tournament.rounds[activeOffice]) as [string, BracketMatch[]][]
    ).sort((a, b) => b[1].length - a[1].length);

    return (
        <div className="tournament">
            {sortedRounds.map(([roundName, matches]) => {
                const typedMatches = matches as BracketMatch[];
                return (
                    <div className="round">
                        {typedMatches.map((match, index) => (
                            <div className="match" key={index}>
                                {roundName}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default Bracket;
