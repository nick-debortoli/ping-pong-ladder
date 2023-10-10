import { SectionProvider } from "../../Contexts/SectionContext";
import { PlayersProvider } from "../../Contexts/PlayersContext";
import MainContent from "../MainContent/MainContent";
import Sidebar from "../Sidebar/Sidebar";
import "./Home.scss";

const Home: React.FC = () => {
  return (
    <div className="home">
      <SectionProvider>
        <PlayersProvider>
          <Sidebar />
          <MainContent />
        </PlayersProvider>
      </SectionProvider>
    </div>
  );
};

export default Home;
