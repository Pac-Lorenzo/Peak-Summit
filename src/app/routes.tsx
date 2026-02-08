import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import { About } from "../pages/About";
import { Strategy } from "../pages/Strategy";
import { Holdings } from "../pages/Holdings";
import { Contact } from "../pages/Contact";
import { AppShell } from "./App";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/strategy", element: <Strategy /> },
      { path: "/holdings", element: <Holdings /> },
      { path: "/contact", element: <Contact /> },
    ],
  },
]);
