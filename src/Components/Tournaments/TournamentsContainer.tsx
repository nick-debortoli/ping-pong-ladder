import { useEffect, useState } from 'react';
import { Office, Tournament } from '../../Types/dataTypes';
import Bracket from './Bracket';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import './TournamentsContainer.scss';
import { getTournamentLogo } from '../../Utils/tournamentUtils';
import { useTournaments } from '../../Contexts/TournamentContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Tooltip } from '@mui/material';

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

    const rules = (
        <>
            <div>Rules</div>
            <br />
            <div>General</div>
            <div>
                The tournaments are to be played in each office independently. There will be a
                winner crowned for each office. Regular season games can still be played during the
                tournament, but they will not count as tournament matches
            </div>
            <br />
            <div>Round Play</div>
            <div>
                A round is played best 2 out of 3 matches to 21, win by 2. The exception to this is
                for the Semifinals and Finals; these we be played as best 3 out of 5. Games in a
                round do not have to be played at the same time - they can be played one after the
                other or on multiple days.
            </div>
            <br />
            <div>Dates</div>
            <div>
                The tournament starts on Monday, January 15 and ends on Friday, February 2. All play
                must be finished by this date.
            </div>
            <br />
            <div>Forfeits</div>
            <div>
                All matches must be played within one week of being challenged by your opponent. If
                this does not happen, the challenger automatically advances and their opponent
                forfeits. Additionally, players can opt to forfeit on their own if they do not feel
                that they can complete the matches.
            </div>
        </>
    );

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
                            <Tooltip title={rules}>
                                <InfoOutlinedIcon sx={{ cursor: 'pointers' }} />
                            </Tooltip>
                        </h3>
                        <ToggleSwitch
                            setTab={setActiveOffice}
                            tabOptions={[Office.PGH, Office.DC]}
                            hasBorder={true}
                        />
                    </div>

                    <Bracket activeOffice={activeOffice} />
                </>
            )}
        </div>
    );
};

export default TournamentsContainer;
