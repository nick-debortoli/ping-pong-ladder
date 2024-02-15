import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getSeasonInfo, updateSeasonInfo } from '../../database/settings';
import { Season } from '../../Types/dataTypes';
import './SeasonSettings.scss';

const SeasonSettings: React.FC = () => {
    const [seasonDate, setSeasonDate] = useState<Season>({
        seasonStartDate: '',
        seasonEndDate: '',
    });
    const [isFormDirty, setIsFormDirty] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const seasonInfo: Season | null = await getSeasonInfo();
                if (seasonInfo) {
                    const { seasonStartDate, seasonEndDate } = seasonInfo;
                    setSeasonDate({ seasonStartDate, seasonEndDate });
                }
            } catch (error) {
                console.error('Error fetching season information:', error);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e): Promise<void> => {
        e.preventDefault();
        await updateSeasonInfo(seasonDate);
        setIsFormDirty(false);
    };

    const handleStartDateChange = (date: string | null) => {
        if (date) {
            setSeasonDate((prevDate) => ({ ...prevDate, seasonStartDate: date }));
            setIsFormDirty(true);
        }
    };

    const handleEndDateChange = (date: string | null) => {
        if (date) {
            setSeasonDate((prevDate) => ({ ...prevDate, seasonEndDate: date }));
            setIsFormDirty(true);
        }
    };

    return (
        <div className="season-settings">
            <div>
                <h4>Season Settings</h4>
                <form onSubmit={handleSubmit} className="admin-settings-form">
                    <div className="form-group">
                        <label className="season-start" htmlFor="season-start">
                            Season Start
                        </label>
                        <DatePicker
                            selected={seasonDate.seasonStartDate}
                            onChange={handleStartDateChange}
                            id="season-start"
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label className="season-end" htmlFor="season-end">
                            Season End
                        </label>
                        <DatePicker
                            selected={seasonDate.seasonEndDate}
                            onChange={handleEndDateChange}
                            id="season-end"
                            className="form-control"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`${isFormDirty ? '' : 'disabled'}`}
                        disabled={!isFormDirty}
                    >
                        Save
                    </button>
                </form>
            </div>

            <button className="reset-season">Reset Season</button>
        </div>
    );
};

export default SeasonSettings;
