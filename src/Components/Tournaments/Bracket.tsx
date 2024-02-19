import { useEffect, useState } from 'react';
import { BracketMatch, Office, Tournament } from '../../Types/dataTypes';
import { usePlayers } from '../../Contexts/PlayersContext';
import { generateTournamentRounds, getRoundName } from '../../Utils/tournamentUtils';
import { updateTournamentRoundsByName } from '../../database/tournaments';
import './Bracket.scss';
import Match from './Match';
import { useTournaments } from '../../Contexts/TournamentContext';

interface BracketProps {
    activeOffice: Office;
}

const Bracket: React.FC<BracketProps> = ({ activeOffice }) => {
    const { getPlayerById } = usePlayers();
    const [rounds, setRounds] = useState<any | null>(null);
    const { getActiveTournament } = useTournaments();

    const [tournament, setTournament] = useState<Tournament | null>(activeTournament);

    useEffect(() => {
        const updateRounds = async () => {
            const activeTournament = getActiveTournament();
            setTournament(activeTournament);

            try {
                if (
                    !activeTournament ||
                    !activeTournament.rounds ||
                    !activeTournament.rounds[activeOffice]
                ) {
                    const players = activeTournament?.seeds[activeOffice];
                    const tournamentRounds = generateTournamentRounds(players);
                    if (activeTournament?.name) {
                        await updateTournamentRoundsByName(
                            tournamentRounds,
                            activeTournament?.name,
                            activeOffice,
                        );
                    }

                    const sortedRounds = (
                        Object.entries(tournamentRounds) as [string, BracketMatch[]][]
                    ).sort((a, b) => b[1].length - a[1].length);
                    setRounds(sortedRounds);
                } else {
                    const sortedRounds = (
                        Object.entries(activeTournament.rounds[activeOffice]) as [
                            string,
                            BracketMatch[],
                        ][]
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
                            {tournament &&
                                typedMatches.map((match, index) => (
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
