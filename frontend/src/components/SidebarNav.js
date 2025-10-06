export default function SidebarNav({ onSelectTab }) {
  const go = (tab) => onSelectTab && onSelectTab(tab);

  const items = [
    { label: "Entry and Exit Management", onClick: () => go("entry") },
    { label: "Hardware Management", onClick: () => go("hardware") }, // <-- NEW
    { label: "Finance Management" },
    { label: "Employee Management" },
    { label: "Security Management" },
    { label: "Slot Management" },
    { label: "Reservation Management" },
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

        {items.map((it, i) => (
          <button key={i} className="sideBtn" onClick={it.onClick}>
            {it.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
