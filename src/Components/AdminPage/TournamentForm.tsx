import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Tournament } from '../../Types/dataTypes';
import { FormControlLabel, Switch } from '@mui/material';

interface TournamentFormProps {
    tournament: Tournament;
    handleSubmit: (e: React.FormEvent, tournament: Tournament) => Promise<void>;
    handleUpdateTournament: (updatedTournament: Tournament) => void;
}

const TournamentForm: React.FC<TournamentFormProps> = ({
    tournament,
    handleSubmit,
    handleUpdateTournament,
}) => {
    const { name, startDate, endDate, seedsLock, topSeedPercentage, isActive } = tournament;

    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isTournamentActive, setIsTournamentActive] = useState<boolean>(isActive);

    const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isActive = event.target.checked;
        const updatedTournament: Tournament = {
            ...tournament,
            isActive,
        };
        setIsTournamentActive(isActive);
        handleUpdateTournament(updatedTournament);
        setIsDirty(true);
    };

    const handleSeedLockChange = (date: string | null) => {
        if (date) {
            const updatedTournament: Tournament = {
                ...tournament,
                seedsLock: date,
            };
            handleUpdateTournament(updatedTournament);
            setIsDirty(true);
        }
    };

    const handleStartDateChange = (date: string | null) => {
        if (date) {
            const updatedTournament: Tournament = {
                ...tournament,
                startDate: date,
            };
            handleUpdateTournament(updatedTournament);
            setIsDirty(true);
        }
    };

    const handleEndDateChange = (date: string | null) => {
        if (date) {
            const updatedTournament: Tournament = {
                ...tournament,
                endDate: date,
            };
            handleUpdateTournament(updatedTournament);
            setIsDirty(true);
        }
    };

    const handleSeedPctChange = (seedPct: string) => {
        const updatedTournament: Tournament = {
            ...tournament,
            topSeedPercentage: Number(seedPct),
        };
        handleUpdateTournament(updatedTournament);
        setIsDirty(true);
    };

    const handleFormClick = async (e) => {
        await handleSubmit(e, tournament);
        setIsDirty(false);
    };

    return (
        <form className="admin-tournament-form" onSubmit={handleFormClick}>
            <h5>{tournament.name}</h5>
            <div className="form-group">
                <label className="tournament-seeds-lock" htmlFor={`tournament-seeds-lock-${name}`}>
                    Seeds Lock
                </label>
                <DatePicker
                    selected={seedsLock || null}
                    onChange={(date) => handleSeedLockChange(date)}
                    id={`tournament-seeds-lock-${name}`}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label className="tournament-start" htmlFor={`tournament-start-${name}`}>
                    Tournament Start
                </label>
                <DatePicker
                    selected={startDate || null}
                    onChange={(date) => handleStartDateChange(date)}
                    id={`tournament-start-${name}`}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label className="tournament-end" htmlFor={`tournament-end-${name}`}>
                    Tournament End
                </label>
                <DatePicker
                    selected={endDate || null}
                    onChange={(date) => handleEndDateChange(date)}
                    id={`tournament-end-${name}`}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label className="seed-pct">Top Seed Percentage</label>
                <input
                    value={topSeedPercentage}
                    onChange={(e) => handleSeedPctChange(e.target.value)}
                    type="text"
                    name="topSeedPct"
                />
            </div>
            <div className="form-group">
                <FormControlLabel
                    control={<Switch checked={isTournamentActive} onChange={handleActiveChange} />}
                    label={isTournamentActive ? 'Active' : 'Inactive'}
                />
            </div>

            <button type="submit" className={`${isDirty ? '' : 'disabled'}`} disabled={!isDirty}>
                Save
            </button>
        </form>
    );
};

export default TournamentForm;
