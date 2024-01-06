import { BASE_ELO, SIGN_IN } from '../../AppConstants';
import { signUp } from '../firebase';
import { useEffect, useState } from 'react';
import './SignUp.scss';
import { useNavigate } from 'react-router-dom';
import { addPlayer } from '../../database/players';
import { Error } from '../../Types/errorTypes';
import TextInput from '../../Components/TextInput/TextInput';
import DropdownSelect from '../../Components/DropdownSelect/DropdownSelect';
import { FormData } from '../../Types/dataTypes';
import { trimFormInput } from '../../Utils/stringUtils';

interface SignUpProps {
    handleChange: (type: string) => void;
}

const SignUp: React.FC<SignUpProps> = ({ handleChange }) => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        firstName: '',
        lastName: '',
        playStyle: 'RH',
        country: '',
        office: 'PGH',
    });

    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [isValidInput, setIsValidInput] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSignUp = async (formData: FormData): Promise<void> => {
        const trimmedInput = trimFormInput(formData);
        const { email, firstName, lastName, office, playStyle, country } = trimmedInput;
        if (!isEmailValid) {
            alert('Invalid email format - must use a Govini email address');
        } else if (firstName.trim() === '' || lastName.trim() === '') {
            alert('Please enter your full name');
        } else {
            try {
                const signupBtn = document.getElementById('signup-btn') as HTMLButtonElement;

                if (signupBtn) {
                    signupBtn.className = 'signup-btn disabled';
                }

                const defaultPassowrd = import.meta.env.VITE_DEFAULT_PASSWORD;
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                await signUp(email, defaultPassowrd);
                await addPlayer({
                    email,
                    firstName,
                    lastName,
                    office,
                    playStyle,
                    country,
                    elo: BASE_ELO,
                    wins: 0,
                    losses: 0,
                    overallRanking: 0,
                    divisionRanking: 0,
                    turnedPro: currentYear,
                });
                navigate('/home');
            } catch (error) {
                const newError = error as Error;
                console.error('Signup failed:', error);
                if (newError.code === 'auth/email-already-in-use') {
                    alert('Email address is already in use. Please use a different email address.');
                } else {
                    // Handle other errors
                    console.error('Signup failed:', error);
                    alert('Signup failed. Please try again later.');
                }
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        const isValid = Object.values(formData).every((value) => value !== '');
        setIsValidInput(isValid);
    };

    const handleDropdownChange = (selectedOffice) => {
        setFormData((prevState) => ({
            ...prevState,
            office: selectedOffice,
        }));
    };

    useEffect(() => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@govini\.com$/;

        setIsEmailValid(emailRegex.test(formData.email));
    }, [formData.email]);

    return (
        <>
            <TextInput
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Govini E-mail Address"
            />
            <TextInput
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
            />
            <TextInput
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
            />
            <TextInput
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Birth Country"
            />
            <DropdownSelect
                id="office-select"
                label="Select Govini Office:"
                onChange={handleDropdownChange}
                dropdownOptions={[
                    { value: 'PGH', label: 'PGH' },
                    { value: 'DC', label: 'DC' },
                ]}
            />
            <DropdownSelect
                id="play-style"
                label="Select Style of Play:"
                onChange={handleDropdownChange}
                dropdownOptions={[
                    { value: 'RH', label: 'Right Handed' },
                    { value: 'LH', label: 'Left Handed' },
                ]}
            />
            <button
                id="signup-btn"
                className={`signup-btn ${isValidInput ? '' : 'disabled'}`}
                onClick={() => handleSignUp(formData)}
            >
                Register
            </button>
            <div className="signup-link">
                Already have an account? <span onClick={() => handleChange(SIGN_IN)}>Sign In</span>.
            </div>
        </>
    );
};

export default SignUp;
