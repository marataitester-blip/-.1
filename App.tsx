
import React from 'react';
import { HashRouter, Route, Routes, NavLink } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import Readings from './pages/Readings';
import Encyclopedia from './pages/Encyclopedia';
import CardDetail from './pages/CardDetail';
import Quiz from './pages/Quiz';
import About from './pages/About';
import Shop from './pages/Shop';
import Feedback from './pages/Feedback';
import Community from './pages/Community';
import Chat from './pages/Chat';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--fg)]">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/readings" element={<Readings />} />
              <Route path="/encyclopedia" element={<Encyclopedia />} />
              <Route path="/card/:id" element={<CardDetail />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/community" element={<Community />} />
              <Route path="/about" element={<About />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;