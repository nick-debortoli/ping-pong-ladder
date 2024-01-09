import { useEffect, useState } from 'react';
import { BracketMatch, Office, Tournament } from '../../Types/dataTypes';
import { usePlayers } from '../../Contexts/PlayersContext';
import { generateTournamentRounds, getRoundName } from '../../Utils/tournamentUtils';
import { getTournamentRounds, updateTournamentRoundsByName } from '../../database/tournaments';
import './Bracket.scss';
import Match from './Match';

interface BracketProps {
    tournament: Tournament;
    activeOffice: Office;
}

const Bracket: React.FC<BracketProps> = ({ tournament, activeOffice }) => {
    const { getPlayerById } = usePlayers();
    const [rounds, setRounds] = useState<any | null>(null);

    useEffect(() => {
        const updateRounds = async () => {
            try {
                // Attempt to fetch existing rounds from the database
                const existingRounds = await getTournamentRounds(tournament.name, activeOffice);

                // Check if rounds exist in the database
                if (existingRounds && Object.keys(existingRounds).length > 0) {
                    const sortedRounds = (
                        Object.entries(existingRounds) as [string, BracketMatch[]][]
                    ).sort((a, b) => b[1].length - a[1].length);
                    setRounds(sortedRounds);
                } else {
                    const players = tournament.seeds[activeOffice];
                    const tournamentRounds = generateTournamentRounds(players);
                    await updateTournamentRoundsByName(
                        tournamentRounds,
                        tournament.name,
                        activeOffice,
                    );

                    const sortedRounds = (
                        Object.entries(tournamentRounds) as [string, BracketMatch[]][]
                    ).sort((a, b) => b[1].length - a[1].length);
                    setRounds(sortedRounds);
                }
            } catch (error) {
                console.error('Error fetching or updating tournament rounds:', error);
            }
        };

        updateRounds();
    }, [tournament, activeOffice, getPlayerById]);

    return (
        <div className="tournament">
            {rounds &&
                rounds.map(([roundName, matches]) => {
                    const typedMatches = matches as BracketMatch[];
                    return (
                        <div className="round">
                            <span className="round-name">
                                {getRoundName(roundName, rounds.length)}
                            </span>
                            {typedMatches.map((match, index) => (
                                <Match
                                    match={match}
                                    tournament={tournament}
                                    activeOffice={activeOffice}
                                    key={index}
                                />
                            ))}
                        </div>
                    );
                })}
        </div>
    );
};

export default Bracket;
