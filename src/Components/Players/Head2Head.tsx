import { Autocomplete, TextField, styled } from '@mui/material';
import { usePlayers } from '../../Contexts/PlayersContext';
import './Head2Head.scss';
import { useState } from 'react';
import H2HPlayerCard from './H2HPlayerCard';
import H2HWinsCircle from './H2HWinsCircle';
import MatchHistory from './MatchHistory';

type H2HPlayers = [string | null, string | null];

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
    '& .MuiChip-root': {
        color: `${darkText} !important`,
        marginRight: '5px',
        '& .MuiChip-deleteIcon': {
            color: `${darkText}`,
            opacity: '0.7',
        },
    },
}));

const Head2Head: React.FC = () => {
    const { players, getPlayerById } = usePlayers();
    const sortedPlayers = players.sort((a, b) => a.firstName.localeCompare(b.firstName));
    const playerNames = sortedPlayers.map((player) => `${player.firstName} ${player.lastName}`);

    const [selectedPlayers, setSelectedPlayers] = useState<H2HPlayers>([null, null]);

    const handlePlayerChange = (_e: React.SyntheticEvent, value: unknown) => {
        if (!Array.isArray(value)) {
            return;
        }

        const selectedValues = value as string[];
        const selected = selectedValues.map((name) => {
            const [firstName, lastName] = name.split(' ');
            return (
                players.find(
                    (player) => player.firstName === firstName && player.lastName === lastName,
                ) || null
            );
        });

        setSelectedPlayers([selected[0]?.id || null, selected[1]?.id || null]);
    };

    return (
        <div className="h2h">
            <div className="h2h-tools">
                <StyledAutocomplete
                    multiple
                    id="autocomplete"
                    sx={{ background: '#242424', borderRadius: '3px', width: '50%' }}
                    options={playerNames}
                    value={selectedPlayers.filter(Boolean).map((playerId) => {
                        const player = playerId && getPlayerById(playerId);
                        if (player) {
                            return `${player.firstName} ${player.lastName}`;
                        }
                    })}
                    onChange={handlePlayerChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            placeholder={
                                !selectedPlayers[0] && !selectedPlayers[1] ? 'Search Player' : ''
                            }
                        />
                    )}
                />
            </div>
            <div className="h2h-cards-container">
                <H2HPlayerCard playerId={selectedPlayers[0]} isFirstCard={true} />
                <H2HPlayerCard playerId={selectedPlayers[1]} />
                <MatchHistory playerIds={selectedPlayers} />
                <H2HWinsCircle />
            </div>
        </div>
    );
};

export default Head2Head;
