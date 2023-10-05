import { createContext, useContext, useState, ReactNode } from 'react';
import { STANDINGS } from './AppConstants';

interface AppContextProps {
  currentSection: string;
  changeSection: (section: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialSection?: string;
}

const AppProvider: React.FC<AppProviderProps> = ({ children, initialSection = STANDINGS }) => {
  const [currentSection, setCurrentSection] = useState(initialSection);

  const changeSection = (section: string) => {
    setCurrentSection(section);
  };

  const contextValue: AppContextProps = {
    currentSection,
    changeSection,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { AppProvider, useAppContext };
