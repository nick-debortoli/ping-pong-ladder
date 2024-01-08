import { useEffect, useState } from 'react';
import { Office, Tournament } from '../../Types/dataTypes';
import { getActiveTournament } from '../../database/tournaments';
import Bracket from './Bracket';
import OfficeToggle from '../OfficeToggle/OfficeToggle';
import './TournamentsContainer.scss';

const TournamentsContainer: React.FC = () => {
    const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
    const [activeOffice, setActiveOffice] = useState<Office>(Office.PGH);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const activeTournamentData: Tournament | null = await getActiveTournament();
                if (activeTournamentData) {
                    setActiveTournament(activeTournamentData);
                }
            } catch (error) {
                console.error('Error fetching active tournament:', error);
            }
        };

        fetchData();
    }, []);

    const handleOfficeClick = (office: Office): void => {
        setActiveOffice(office);
    };

    return (
        <div className="tournaments-container">
            {activeTournament && (
                <>
                    <div className="tournament-top-bar">
                        <h3>{activeTournament.name}</h3>
                        <OfficeToggle onOfficeClick={handleOfficeClick} hasBorder={true} />
                    </div>

                    <Bracket tournament={activeTournament} activeOffice={activeOffice} />
                </>
            )}
        </div>
    );
};

export default TournamentsContainer;
