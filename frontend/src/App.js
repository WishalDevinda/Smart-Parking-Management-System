// src/App.js
// Purpose: Central routing for the React app (multiple pages, no nav)

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Adjust casing to match your actual filenames
import ExitEntry from "./pages/exitEntry";            // or "./pages/exitEntry"
import RegisterVehicle from "./pages/registerVehicle"; // or "./pages/registerVehicle"
import SystemHardware from "./pages/systemHardware";
// import Payments from "./pages/Payments"; // optional placeholder

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default page */}
        <Route path="/" element={<RegisterVehicle />} />

        {/* Parking flow */}
        <Route path="/exit" element={<ExitEntry />} />
        <Route path="/register" element={<RegisterVehicle />} />
        {/* <Route path="/payments" element={<Payments />} /> */}

        {/* Hardware CRUD */}
        <Route path="/hardware" element={<SystemHardware />} />

        {/* Catch-all */}
        <Route path="*" element={<ExitEntry />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
