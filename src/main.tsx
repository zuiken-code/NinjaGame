import React from "react";
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './components/App.tsx'
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Top from './components/top.tsx';
import RankingPage from './components/RankingPage.tsx';

const router = createHashRouter([
  {
    path: "/",
    element: <Top />,
  },
  {
    path: "/game",
    element: <App />,
  },
  {
    path: "/ranking",
    element: <RankingPage />,
  },
],);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
