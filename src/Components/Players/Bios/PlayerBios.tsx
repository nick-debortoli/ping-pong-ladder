import React, { useState, useEffect } from 'react';
import { Autocomplete, IconButton, TextField, Tooltip, styled } from '@mui/material';
import { usePlayers } from '../../../Contexts/PlayersContext';
import { NewPlayer } from '../../../Types/dataTypes';
import PlayerCard from './PlayerCard';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';
import './PlayerBios.scss';

const darkText = '#d6d6d6';

const StyledAutocomplete = styled(Autocomplete)(() => ({
    input: {
        color: `${darkText}`,
        '&::placeholder': {
            color: `${darkText}`,
        },
        '&:focus': {
            borderColor: `${darkText}`,
        },
    },
}));

const PlayerBios: React.FC = () => {
    const { players, getTopPlayer } = usePlayers();

    const sortedPlayers = players.sort((a, b) => {
        if (a.seasonStats.overallRanking === 0 && b.seasonStats.overallRanking === 0) {
            return a.bio.lastName.localeCompare(b.bio.lastName);
        } else if (a.seasonStats.overallRanking === 0) {
            return 1;
        } else if (b.seasonStats.overallRanking === 0) {
            return -1;
        }
        return a.seasonStats.overallRanking - b.seasonStats.overallRanking; // By ranking
    });

    const playerNames = sortedPlayers.map(
        (player) => `${player.bio.firstName} ${player.bio.lastName}`,
    );
    const [focusedPlayer, setFocusedPlayer] = useState<NewPlayer>(sortedPlayers[0]);

    useEffect(() => {
        const topPlayer = getTopPlayer();
        setFocusedPlayer(topPlayer);
    }, [players, getTopPlayer]);

    const handleSearch = (_, newPlayer) => {
        if (newPlayer) {
            const [firstName, lastName] = newPlayer.split(' ');
            const player = sortedPlayers.find(
                (player) => player.bio.firstName === firstName && player.bio.lastName === lastName,
            );
            if (player) {
                setFocusedPlayer(player);
            }
        }
    };

    const handleChangePlayer = (isForward: boolean): void => {
        const currentIndex = sortedPlayers.findIndex((player) => player.id === focusedPlayer.id);
        let newIndex = isForward ? currentIndex + 1 : currentIndex - 1;

        newIndex = Math.max(0, Math.min(sortedPlayers.length - 1, newIndex));

        setFocusedPlayer(sortedPlayers[newIndex]);
    };

    return (
        <div className="player-bios">
            <div className="player-bio-tools">
                <StyledAutocomplete
                    id="autocomplete"
                    sx={{ background: '#242424', borderRadius: '3px', width: '50%' }}
                    options={playerNames}
                    renderInput={(params) => (
                        <TextField {...params} variant="outlined" placeholder="Search Player" />
                    )}
                    onChange={handleSearch}
                />
                <div>
                    <Tooltip title="View previous player">
                        <IconButton
                            className="change-player-button"
                            onClick={() => handleChangePlayer(false)}
                        >
                            <ArrowLeft />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="View next player">
                        <IconButton
                            className="change-player-button"
                            onClick={() => handleChangePlayer(true)}
                        >
                            <ArrowRight />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <PlayerCard player={focusedPlayer} />
        </div>
    );
};

export default PlayerBios;
