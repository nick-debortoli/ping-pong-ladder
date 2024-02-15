import { Autocomplete, IconButton, TextField, Tooltip, styled } from '@mui/material';
import { usePlayers } from '../../Contexts/PlayersContext';
import { NewPlayer } from '../../Types/dataTypes';
import { useState } from 'react';
import PlayerCard from './PlayerCard';
import './PlayerBios.scss';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';

const darkText = '#d6d6d6';
const StyledAutocomplete = styled(Autocomplete)(() => ({
    input: {
        color: `${darkText}`,
        '&::placeholder': {
            color: `${darkText}`,
        },
        '&:focus': {
            fieldset: `${darkText}`,
        },
    },
}));

const PlayerBios: React.FC = () => {
    const { players, getTopPlayer } = usePlayers();
    const sortedPlayers = players.sort((a, b) => a.bio.firstName.localeCompare(b.bio.firstName));
    const playerNames = sortedPlayers.map(
        (player) => `${player.bio.firstName} ${player.bio.lastName}`,
    );
    const [focusedPlayer, setFocusedPlayer] = useState<NewPlayer>(getTopPlayer());

    const handleSearch = (_, newPlayer) => {
        let nextPlayer: NewPlayer = getTopPlayer();
        if (newPlayer) {
            const [firstName, lastName] = newPlayer.split(' ');
            const player = players.find((player) => {
                return player.bio.firstName === firstName && player.bio.lastName === lastName;
            });
            if (player) {
                nextPlayer = player;
            }
        }
        setFocusedPlayer(nextPlayer);
    };

    const handleChangePlayer = (isForward: boolean): void => {
        const currentRank = focusedPlayer.seasonStats.overallRanking;
        let newRank = currentRank;

        if (isForward) {
            newRank = currentRank + 1;
        } else {
            newRank = currentRank - 1;
        }

        const player = players.find((player) => {
            return player.seasonStats.overallRanking === newRank;
        });

        if (player) {
            setFocusedPlayer(player);
        }
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
