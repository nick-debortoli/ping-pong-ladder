import BlankPage from '../../Components/BlankPage';
import { ReactElement, useState } from 'react';
import { SIGN_IN } from '../../AppConstants';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Modal from '../../Components/Modal/Modal';

const Registration: React.FC = () => {
    const [registrationType, setRegistrationType] = useState<string>(SIGN_IN);

    let modalContent: ReactElement;
    let modalText: string;

    const hanldeSwitchRegistration = (type: string): void => {
        setRegistrationType(type);
    };

    if (registrationType === SIGN_IN) {
        modalText = 'Sign In';
        modalContent = <SignIn handleChange={hanldeSwitchRegistration} />;
    } else {
        modalText = 'Sign Up';
        modalContent = <SignUp handleChange={hanldeSwitchRegistration} />;
    }

    return (
        <BlankPage>
            <Modal titleText={modalText}>{modalContent}</Modal>
        </BlankPage>
    );
};

export default Registration;
