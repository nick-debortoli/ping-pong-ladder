import { Autocomplete, TextField, styled } from '@mui/material';
import { usePlayers } from '../../Contexts/PlayersContext';
import { Player } from '../../Types/dataTypes';
import { useState } from 'react';

const darkText = '#d6d6d6';
const StyledAutocomplete = styled(Autocomplete)(() => ({
    input: {
        color: `${darkText}`,
        '&::placeholder': {
            color: `${darkText}`,
        },
        '&:focus': {
            fieldset: `${darkText}`, // Set the outline color to darkText
        },
    },
}));

const PlayerBios: React.FC = () => {
    const { players, getTopPlayer } = usePlayers();
    const sortedPlayers = players.sort((a, b) => a.firstName.localeCompare(b.firstName));
    const playerNames = sortedPlayers.map((player) => `${player.firstName} ${player.lastName}`);
    const [focusedPlayer, setFocusedPlayer] = useState<Player>(getTopPlayer());

    const handleSearch = (event, newPlayer) => {
        let nextPlayer: Player = getTopPlayer();
        if (newPlayer) {
            const [firstName, lastName] = newPlayer.split(' ');
            const player = players.find((player) => {
                return player.firstName === firstName && player.lastName === lastName;
            });
            if (player) {
                nextPlayer = player;
            }
        }
        setFocusedPlayer(nextPlayer);
    };

    return (
        <div className="player-bios">
            <div className="player-bio-tools">
                <StyledAutocomplete
                    id="autocomplete"
                    sx={{ background: '#242424', borderRadius: '3px' }}
                    options={playerNames}
                    renderInput={(params) => (
                        <TextField {...params} variant="outlined" placeholder="Search Player" />
                    )}
                    onChange={handleSearch}
                />
            </div>
            <div>{focusedPlayer.overallRanking}</div>
        </div>
    );
};

export default PlayerBios;
