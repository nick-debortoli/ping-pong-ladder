import './App.scss';
import MainContent from './Components/MainContent/MainContent';
import Sidebar from './Components/Sidebar/Sidebar';

const App = () => {
  return (
    <div id='app' className='app'>
      <Sidebar />
      <MainContent />
    </div>
  )
}

export default App
