import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import Expenses from './pages/Expenses';
import News from './pages/News';
import Notes from './pages/Notes';
import Chat from './pages/Chat';
import Routine from './pages/Routine';

function App() {
  return (
    <BrowserRouter basename="/Daily-Life-Tracker">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="weather" element={<Weather />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="news" element={<News />} />
          <Route path="notes" element={<Notes />} />
          <Route path="chat" element={<Chat />} />
          <Route path="routine" element={<Routine />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
