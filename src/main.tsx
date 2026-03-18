import React from "react";
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.tsx'
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Top from './top.tsx';

const router = createHashRouter([
  {
    path: "/",
    element: <Top />,
  },
  {
    path: "/game",
    element: <App />,
  },
],);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
