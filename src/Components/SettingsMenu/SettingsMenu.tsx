import { useState } from 'react';
import BugReportIcon from '@mui/icons-material/BugReport';
import { IconButton, Tooltip, ClickAwayListener } from '@mui/material';
import './settingsMenu.scss';
import Modal from '../Modal/Modal';
import { addBug } from '../../database/bugs';

const SettingsMenu = () => {
    const defaultFormData = {
        type: 'Bug',
        name: '',
        email: '',
        description: '',
    };
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [formData, setFormData] = useState(defaultFormData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (value && name === 'description') {
            setIsValid(true);
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setIsValid(false);
        setFormData(defaultFormData);
    };

    const handleSubmit = async () => {
        try {
            await addBug(formData);
        } catch (error) {
            console.error('Error sending email:', error);
        }
        handleClose();
    };

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <div className="settings-container">
                <Tooltip title="Submit bug or feature request.">
                    <IconButton className="settings-button" onClick={() => setIsModalOpen(true)}>
                        <BugReportIcon sx={{ color: 'white' }} />
                    </IconButton>
                </Tooltip>

                {isModalOpen && (
                    <Modal>
                        <h3>Submit Bug or Feature Request</h3>
                        <form className="feature-request">
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="Feature">Feature</option>
                                    <option value="Bug">Bug</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Name (Optional)</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email (Optional)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Description <span style={{ color: 'red' }}>*</span>
                                </label>
                                <textarea
                                    name="description"
                                    style={{ maxWidth: '380px', maxHeight: '550px' }}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="close-button"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className={isValid ? '' : 'disabled'}
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </ClickAwayListener>
    );
};

export default SettingsMenu;
