import { NavLink, Outlet } from "react-router-dom";
import "../styles/theme.css";

export default function Layout() {
  return (
    <>
      <header className="header">
        <div className="brand">
          {/* Logo from public/ (note the leading slash) */}
          <img src="/autoslot-logo.jpg" alt="AutoSlot Logo" className="logoImg" />

          <div>
            <div className="brandTitle">AutoSlot</div>
            <div className="brandSub">SMART PARKING MANAGEMENT SYSTEM</div>
          </div>
        </div>

        <div className="userCard">
          <div className="userName">Ayesha</div>
          <div className="userRole">Billing Officer</div>
          <div className="avatar" />
        </div>
      </header>

      <nav className="nav">
        <NavLink to="/payments" className={({isActive}) => isActive ? "active" : ""}>Payments</NavLink>
        <NavLink to="/rates" className={({isActive}) => isActive ? "active" : ""}>Rates</NavLink>
        <NavLink to="/extra-charges" className={({isActive}) => isActive ? "active" : ""}>Extra Charges</NavLink>
        <NavLink to="/refunds" className={({isActive}) => isActive ? "active" : ""}>Refunds</NavLink>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
