import { AppProvider } from "../../AppContext";
import MainContent from "../MainContent/MainContent";
import Sidebar from "../Sidebar/Sidebar";
import './Home.scss';

const Home: React.FC = () => {
  return (
    <div className="home">
      <AppProvider>
        <Sidebar />
        <MainContent />
      </AppProvider>
    </div>
  );
};

export default Home;
