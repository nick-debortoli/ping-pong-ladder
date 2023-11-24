import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton } from '@mui/material';
import './settingsMenu.scss';
import Modal from '../Modal/Modal';

const SettingsMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        type: 'Feature', // Default value for the dropdown
        name: '',
        email: '',
        description: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        // You can send an email with the formData here
        // You'll need to implement the email sending logic
        // Example: sendEmail(formData);

        // Close the modal
        setIsModalOpen(false);
    };

    return (
        <div className="settings-container">
            <IconButton className="settings-button" onClick={() => setIsModalOpen(true)}>
                <SettingsIcon sx={{ color: 'white' }} />
            </IconButton>

            {isModalOpen && (
                <Modal titleText={'Submit Feature Request or Bug'}>
                    <form>
                        <div className="form-group">
                            <label>Type</label>
                            <select name="type" value={formData.type} onChange={handleInputChange}>
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
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                            <button type="button" onClick={handleSubmit}>
                                Submit
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default SettingsMenu;
