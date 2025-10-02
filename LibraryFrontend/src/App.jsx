import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './styles/App.css';
import Books from './pages/Books.jsx';
import Members from './pages/Members.jsx';
import BookDetails from './pages/BookDetails.jsx';
import MemberDetails from './pages/MemberDetails.jsx';


function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<Books />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/members" element={<Members />} />
          <Route path="/member/:id" element={<MemberDetails />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
