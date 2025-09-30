import { useEffect, useMemo, useState } from "react";
import { VehiclesAPI } from "../services/vehicles";
import "../styles/registerVehicle.css";

const VEHICLE_TYPES = [
  { value: "", label: "Select type…" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "bike", label: "Bike" },
  { value: "truck", label: "Truck" },
  { value: "bus", label: "Bus" },
];

export default function RegisterVehicle() {
  // Form state
  const [form, setForm] = useState({ vehicleNumber: "", vehicleType: "" });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState("");

  // Basic validation
  const canSubmit = useMemo(
    () => form.vehicleNumber.trim().length >= 3 && !!form.vehicleType,
    [form]
  );

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function loadVehicles() {
    try {
      setLoading(true);
      const data = await VehiclesAPI.list(); // expecting { count, vehicles }
      setVehicles(Array.isArray(data?.vehicles) ? data.vehicles : []);
    } catch (e) {
      console.error(e);
      setVehicles([]);
      setToast({ t: "error", m: "Failed to load vehicle list" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setToast(null);

    if (!canSubmit) {
      setToast({ t: "error", m: "Please fill both fields correctly." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await VehiclesAPI.create({
        vehicleNumber: form.vehicleNumber.trim(),
        vehicleType: form.vehicleType,
      });
      setToast({
        t: "success",
        m: `Vehicle registered: ${res?.vehicle?.vehicleID || "created"}`,
      });
      setForm({ vehicleNumber: "", vehicleType: "" });
      await loadVehicles();
    } catch (err) {
      setToast({ t: "error", m: err.message || "Failed to register vehicle" });
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      [v?.vehicleNumber, v?.vehicleID, v?._id, v?.vehicleType]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [vehicles, filter]);

  if (loading) {
    return (
      <div className="centerWrap">
        <div className="spinner" />
        <div className="muted">Loading vehicle data…</div>
      </div>
    );
  }

  const cars = vehicles.filter((v) => v.vehicleType === "car").length;
  const bikes = vehicles.filter((v) => v.vehicleType === "bike").length;
  const vans = vehicles.filter((v) => v.vehicleType === "van").length;

  return (
    <div className="rv-page">
      {/* Header */}
      <div className="rv-header">
        <h1 className="rv-title">Vehicle Registration</h1>
        <p className="rv-sub">Add new vehicles and review recent entries</p>
      </div>

      {/* Snapshot (now displayed as a responsive grid of stat cards) */}
      <section className="card">
        <div className="cardTitleRow">
          <h3 className="cardTitle">Current Snapshot</h3>
          <span className="realtime">Live</span>
        </div>

        <div className="statsGrid">
          <div className="statCard">
            <div className="statNumber">{vehicles.length}</div>
            <div className="statLabel">Total Vehicles</div>
          </div>

          <div className="statCard">
            <div className="statNumber">{cars}</div>
            <div className="statLabel">Cars</div>
          </div>

          <div className="statCard">
            <div className="statNumber">{bikes}</div>
            <div className="statLabel">Bikes</div>
          </div>

          <div className="statCard">
            <div className="statNumber">{vans}</div>
            <div className="statLabel">Vans</div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="card">
        <h3 className="cardTitle">Register New Vehicle</h3>

        {toast && <div className={`toast ${toast.t}`}>{toast.m}</div>}

        <form className="rv-form" onSubmit={onSubmit}>
          <div className="formRow">
            <label>Vehicle Number *</label>
            <input
              placeholder="e.g., WP-CAB-1234"
              value={form.vehicleNumber}
              onChange={(e) =>
                update("vehicleNumber", e.target.value.toUpperCase())
              }
              required
            />
          </div>

          <div className="formRow">
            <label>Vehicle Type *</label>
            <select
              value={form.vehicleType}
              onChange={(e) => update("vehicleType", e.target.value)}
              required
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t.value || "na"} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="primaryBtn"
            type="submit"
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Saving…" : "Register"}
          </button>
        </form>
      </section>

      {/* Table */}
      <section className="card">
        <div className="tableTop">
          <h3 className="cardTitle">Recent Vehicles</h3>
          <input
            className="searchInput"
            placeholder="Search number / ID / type…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="tableWrap">
          <table className="rv-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Number</th>
                <th>Type</th>
                <th>Date</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Duration</th>
                <th>Slot</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v._id || v.vehicleID}>
                  <td className="idCell">{v.vehicleID || v._id}</td>
                  <td className="strong">{v.vehicleNumber}</td>
                  <td className="cap">{v.vehicleType}</td>
                  <td>{v.date || "—"}</td>
                  <td>{v.entryTime || "—"}</td>
                  <td>{v.exitTime ?? "—"}</td>
                  <td>{v.duration ?? "—"}</td>
                  <td>{v.slotID ?? "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted center">
                    No vehicles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Page badge */}
      <div className="liveBadge">Live Updates Active</div>
    </div>
  );
}
