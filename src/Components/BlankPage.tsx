import { ReactElement } from 'react';
import AppTitle from './AppTitle/AppTitle';
import './BlankPage.scss';

interface BlankPageProps {
    children: ReactElement;
}
const BlankPage: React.FC<BlankPageProps> = ({ children }) => {
    return (
        <div className="blank-page">
            <AppTitle variant="center" />
            {children}
        </div>
    );
};

export default BlankPage;
