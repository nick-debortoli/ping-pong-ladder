import './App.scss';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NotFound from './Components/NotFound.tsx';
import Registration from './Security/Registration/Registration.tsx';
import Home from './Components/Home/Home.tsx';
import { useEffect, useState } from 'react';
import { auth } from './Security/firebase'; // Import your Firebase configuration
import { User } from 'firebase/auth';
import { PlayersProvider } from './Contexts/PlayersContext.tsx';
import { isAdmin } from './Utils/playerUtils.ts';
import AdminPage from './Components/AdminPage/AdminPage.tsx';
import { SectionProvider } from './Contexts/SectionContext.tsx';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => {
            unsubscribe();
        };
    });
    return (
        <div id="app" className="app">
            <PlayersProvider>
                <SectionProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Registration />} />
                            {user ? (
                                <Route path="/home" element={<Home />} />
                            ) : (
                                <Route path="/home" element={<Navigate to="/" />} />
                            )}
                            {isAdmin(user?.uid) && <Route path="/admin" element={<AdminPage />} />}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Router>
                </SectionProvider>
            </PlayersProvider>
        </div>
    );
};

export default App;
