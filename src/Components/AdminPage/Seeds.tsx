import React, { useState } from 'react';
import { Office, Tournament } from '../../Types/dataTypes';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import './Seeds.scss';
import { usePlayers } from '../../Contexts/PlayersContext';
import { updateTournamentInfo } from '../../database/tournaments';

interface SeedsProps {
    tournament: Tournament;
    handleUpdateTournament: (updatedTournament: Tournament) => void;
}

const Seeds: React.FC<SeedsProps> = ({ tournament, handleUpdateTournament }) => {
    const [areSeedsGenerated, setAreSeedsGenerated] = useState<boolean>(false);
    const [activeOffice, setActiveOffice] = useState<Office>(Office.PGH);
    const { players, getPlayerById } = usePlayers();

    const handleGenerateSeeds = (): void => {
        const filteredPlayers = players.filter((player) => {
            return (
                player.bio.office === activeOffice &&
                (player.seasonStats.wins > 0 || player.seasonStats.losses > 0)
            );
        });

        const percentage = Math.floor(
            (tournament.topSeedPercentage / 100) * filteredPlayers.length,
        );

        const sortedPlayers = filteredPlayers.sort(
            (a, b) => a.seasonStats.divisionRanking - b.seasonStats.divisionRanking,
        );

        const topPlayerIds = sortedPlayers.slice(0, percentage).map((player) => player.id);
        const bottomPlayerIds = sortedPlayers.slice(percentage).map((player) => player.id);

        const shuffledBottomPlayerIds = [...bottomPlayerIds].sort(() => Math.random() - 0.5);

        const selectedPlayerIds = [...topPlayerIds, ...shuffledBottomPlayerIds];
        const updatedTournament: Tournament = {
            ...tournament,
            seeds: {
                ...tournament.seeds,
                [activeOffice]: selectedPlayerIds,
            },
        };

        handleUpdateTournament(updatedTournament);

        setAreSeedsGenerated(true);
    };

    const handleSaveSeeds = async (): Promise<void> => {
        await updateTournamentInfo(tournament);
        setAreSeedsGenerated(false);
    };

    return (
        <div className="seeds">
            <div className="seeds-topbar">
                <h5>Seeds</h5>
                <ToggleSwitch setTab={setActiveOffice} tabOptions={[Office.PGH, Office.DC]} />
            </div>
            <div className="player-seeds">
                {(tournament.seeds?.[activeOffice] || []).map((id, index) => {
                    const player = getPlayerById(id);
                    return (
                        <div key={index} className="player-seed">
                            <span className="seed-number">{index + 1})</span>
                            <div>
                                {player?.bio.firstName} {player?.bio.lastName}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="seed-buttons">
                <button
                    onClick={handleSaveSeeds}
                    className={`${areSeedsGenerated ? '' : 'disabled'}`}
                    disabled={!areSeedsGenerated}
                >
                    Save
                </button>
                <button onClick={handleGenerateSeeds}>Generate</button>
            </div>
        </div>
    );
};

export default Seeds;
