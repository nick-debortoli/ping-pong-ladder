import './App.scss';
import MainContent from './Components/MainContent/MainContent';
import Sidebar from './Components/Sidebar/Sidebar';
import { AppProvider } from './AppContext';

const App: React.FC = () => {
  return (
    <div id='app' className='app'>
      <AppProvider>
        <Sidebar />
        <MainContent />
      </AppProvider>
    </div>
  )
}

export default App
