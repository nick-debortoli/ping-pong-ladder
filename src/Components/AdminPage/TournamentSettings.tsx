import { useEffect, useState } from 'react';
import { Tournament } from '../../Types/dataTypes';
import { getTournaments, updateTournamentInfo } from '../../database/tournaments';
import './TournamentSettings.scss';
import TopSeeds from './Seeds';
import TournamentForm from './TournamentForm';
import { Switch } from '@mui/material';

const TournamentSettings: React.FC = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tournamentInfo: Tournament[] | null = await getTournaments();
                if (tournamentInfo) {
                    setTournaments(tournamentInfo);
                }
            } catch (error) {
                console.error('Error fetching season information:', error);
            }
        };

        fetchData();
    }, []);

    const handleUpdateTournament = (updatedTournament: Tournament): void => {
        setTournaments((prevTournaments) =>
            prevTournaments.map((tournament) =>
                tournament.name === updatedTournament.name ? updatedTournament : tournament,
            ),
        );
    };

    const handleSubmit = async (e, tournament: Tournament): Promise<void> => {
        e.preventDefault();
        await updateTournamentInfo(tournament);
    };

    const handleSwitchChange = async (tournament: Tournament): Promise<void> => {
        try {
            const updatedTournament: Tournament = {
                ...tournament,
                isActive: !tournament.isActive, // Toggle isActive
            };

            await updateTournamentInfo(updatedTournament);

            setTournaments((prevTournaments) =>
                prevTournaments.map((t) =>
                    t.name === updatedTournament.name ? updatedTournament : t,
                ),
            );
        } catch (error) {
            console.error('Error updating tournament information:', error);
        }
    };

    return (
        <>
            <h4>Tournament Settings</h4>
            {tournaments.map((tournament) => {
                return (
                    <div className="tournament-container">
                        <div className="tournament-forms">
                            <TournamentForm
                                handleSubmit={handleSubmit}
                                handleUpdateTournament={handleUpdateTournament}
                                tournament={tournament}
                            />
                            <TopSeeds
                                tournament={tournament}
                                handleUpdateTournament={handleUpdateTournament}
                            />
                        </div>
                        <div className="active-switch">
                            Active:
                            <Switch
                                checked={tournament.isActive}
                                onChange={() => handleSwitchChange(tournament)}
                            />
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default TournamentSettings;
