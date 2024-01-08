import { ADMIN } from '../../AppConstants';
import { useSectionContext } from '../../Contexts/SectionContext';
import MainContent from '../MainContent/MainContent';
const AdminPage: React.FC = () => {
    const { changeSection } = useSectionContext();
    changeSection(ADMIN);
    return <MainContent />;
};

export default AdminPage;
