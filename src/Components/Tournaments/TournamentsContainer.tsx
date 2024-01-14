import { useEffect, useState } from 'react';
import { Office, Tournament } from '../../Types/dataTypes';
import Bracket from './Bracket';
import OfficeToggle from '../OfficeToggle/OfficeToggle';
import './TournamentsContainer.scss';
import { getTournamentLogo } from '../../Utils/tournamentUtils';
import { useTournaments } from '../../Contexts/TournamentContext';

const TournamentsContainer: React.FC = () => {
    const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
    const [activeOffice, setActiveOffice] = useState<Office>(Office.PGH);
    const [logo, setLogo] = useState<string | null>(null);
    const { getActiveTournament } = useTournaments();

    useEffect(() => {
        const fetchData = async () => {
            const activeTournamentData: Tournament | null = getActiveTournament();
            if (activeTournamentData) {
                getTournamentLogo(activeTournamentData.name)
                    .then((logoUrl) => {
                        setLogo(logoUrl);
                    })
                    .catch((error) => {
                        console.error('Error fetching logo:', error);
                        setLogo(null);
                    });
                setActiveTournament(activeTournamentData);
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
                        <h3 className="tournament-name">
                            {logo && (
                                <img
                                    className="tournament-logo"
                                    src={logo}
                                    alt={`${activeTournament.name}  logo`}
                                />
                            )}
                            {activeTournament.name}
                        </h3>
                        <OfficeToggle onOfficeClick={handleOfficeClick} hasBorder={true} />
                    </div>

                    <Bracket activeOffice={activeOffice} />
                </>
            )}
        </div>
    );
};

export default TournamentsContainer;
