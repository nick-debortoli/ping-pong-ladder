import { Autocomplete, TextField, styled } from '@mui/material';
import { usePlayers } from '../../../Contexts/PlayersContext';
import './Head2Head.scss';
import { useEffect, useState } from 'react';
import H2HPlayerCard from './H2HPlayerCard';
import H2HWinsCircle from './H2HWinsCircle';
import MatchHistory from './MatchHistory';
import { HeadToHead } from '../../../Types/dataTypes';

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
    const { players, getPlayerById, getH2HByOpponent } = usePlayers();
    const sortedPlayers = players.sort((a, b) => a.bio.firstName.localeCompare(b.bio.firstName));
    const playerNames = sortedPlayers.map(
        (player) => `${player.bio.firstName} ${player.bio.lastName}`,
    );

    const [selectedPlayers, setSelectedPlayers] = useState<H2HPlayers>([null, null]);
    const [headToHead, setHeadToHead] = useState<HeadToHead | null>(null);

    const handlePlayerChange = (_e: React.SyntheticEvent, value: unknown) => {
        if (!Array.isArray(value)) {
            return;
        }

        const selectedValues = value as string[];
        const selected = selectedValues.map((name) => {
            const [firstName, lastName] = name.split(' ');
            return (
                players.find(
                    (player) =>
                        player.bio.firstName === firstName && player.bio.lastName === lastName,
                ) || null
            );
        });

        setSelectedPlayers([selected[0]?.id || null, selected[1]?.id || null]);
    };

    useEffect(() => {
        const fetchData = async (playerId: string, opponentId: string) => {
            const h2hData: HeadToHead | null = getH2HByOpponent(playerId, opponentId);
            if (h2hData) {
                setHeadToHead(h2hData);
            } else {
                setHeadToHead(null);
            }
        };
        if (selectedPlayers[0] && selectedPlayers[1]) {
            fetchData(selectedPlayers[0], selectedPlayers[1]);
        } else {
            setHeadToHead(null);
        }
    }, [selectedPlayers]);

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
                            return `${player.bio.firstName} ${player.bio.lastName}`;
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
                <H2HPlayerCard
                    playerId={selectedPlayers[0]}
                    isFirstCard={true}
                    isWinner={!!headToHead && headToHead.wins >= headToHead.losses}
                />
                <H2HPlayerCard
                    playerId={selectedPlayers[1]}
                    isWinner={!!headToHead && headToHead.losses > headToHead.wins}
                />
                <MatchHistory headToHead={headToHead} />
                <H2HWinsCircle
                    headToHead={headToHead}
                    hasBothPlayers={selectedPlayers[0] !== null && selectedPlayers[1] !== null}
                />
            </div>
        </div>
    );
};

export default Head2Head;
