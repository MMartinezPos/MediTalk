import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Importing the pages of web app
import Home from './pages/Home';
import NavBar from './NavBar';
import Team from './pages/Team';
import Blog from './pages/Blog';
import Log from './pages/Log';
import NoPage from "./pages/NoPage";
import routes from './routes';
import './App.css';
import BlogCopy from "./pages/BlogCopy";




export default function App() {
  return (
    <div>
      <BrowserRouter>
        <NavBar /> {}
        <Routes>
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/blog" element={<BlogCopy />} />
          <Route path="/log" element={<Log />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}