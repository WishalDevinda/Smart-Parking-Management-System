export default function SidebarNav() {
  const items = [
    "Entry and Exit Management",
    "Hardware Management",
    "Finance Management",
    "Employee Management",
    "Security Management",
    "Slot Management",
    "Reservation Management",
    // add more as needed
  ];

  return (
    <aside className="sidebar">
      <div className="sidebarInner">
        <h2 style={{ marginTop: 4 }}>
          Smart Parking
          <br />
          Management
          <br />
          System
        </h2>

        {items.map((t, i) => (
          <button key={i} className="sideBtn">
            {t}
          </button>
        ))}
      </div>
    </aside>
  );
}
