import { createContext, useContext, useState, ReactNode } from 'react';
import { STANDINGS } from '../AppConstants';

interface SectionContextProps {
  currentSection: string;
  changeSection: (section: string) => void;
}

const SectionContext = createContext<SectionContextProps | undefined>(undefined);

interface SectionProviderProps {
  children: ReactNode;
  initialSection?: string;
}

const SectionProvider: React.FC<SectionProviderProps> = ({ children, initialSection = STANDINGS }) => {
  const [currentSection, setCurrentSection] = useState(initialSection);

  const changeSection = (section: string) => {
    setCurrentSection(section);
  };

  const contextValue: SectionContextProps = {
    currentSection,
    changeSection,
  };

  return <SectionContext.Provider value={contextValue}>{children}</SectionContext.Provider>;
};

const useSectionContext = (): SectionContextProps => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useSectionContext must be used within an SectionProvider');
  }
  return context;
};

export { SectionProvider, useSectionContext };
