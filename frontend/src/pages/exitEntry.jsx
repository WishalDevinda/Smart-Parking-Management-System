// src/pages/ExitEntry.jsx
// Purpose: Counter page. Type a vehicle number, fetch record, set exit time,
// compute duration, and move to payment with the vehicle identifier.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VehiclesAPI } from "../services/vehicles";
import "../styles/registerVehicle.css"; // re-use the shared styles

export default function ExitEntry() {
  // View state. Keep it minimal and predictable for the counter workflow.
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Search existing record by typed number.
  async function findVehicle(e) {
    e?.preventDefault?.();
    setToast(null);

    const num = vehicleNumber.trim();
    if (!num) {
      setToast({ t: "error", m: "Please enter a vehicle number" });
      return;
    }

    try {
      setLoading(true);
      const res = await VehiclesAPI.getByNumber(num.toUpperCase());
      setVehicle(res.vehicle);
    } catch (err) {
      setVehicle(null);
      setToast({ t: "error", m: err.message || "Vehicle not found" });
    } finally {
      setLoading(false);
    }
  }

  // Set exit now on the server and compute duration based on entry date/time.
  async function setExitAndCalculate() {
    if (!vehicle?.vehicleNumber) return;
    setToast(null);

    try {
      setSaving(true);
      const res = await VehiclesAPI.exitByNumber(vehicle.vehicleNumber);
      setVehicle(res.vehicle);
      setToast({ t: "success", m: "Exit time recorded and duration calculated" });
    } catch (err) {
      setToast({ t: "error", m: err.message || "Failed to record exit" });
    } finally {
      setSaving(false);
    }
  }

  // Move to payment carrying the vehicle identifier in the query string.
  function goToPayment() {
    if (!vehicle) return;
    const id = vehicle.vehicleID || vehicle._id;
    navigate(`/payments?vehicleID=${encodeURIComponent(id)}`);
  }

  return (
    <div className="rv-page">
      {/* Header with the same style language as your dashboard */}
      <div className="rv-header">
        <h1 className="rv-title">Exit Entry</h1>
        <p className="rv-sub">Find a vehicle, set exit time, and proceed to payment</p>
      </div>

      {/* Finder section */}
      <section className="card">
        <h3 className="cardTitle">Find Vehicle by Number</h3>

        {toast && <div className={`toast ${toast.t}`}>{toast.m}</div>}

        <form className="rv-form" onSubmit={findVehicle}>
          <div className="formRow">
            <label>Vehicle Number *</label>
            <input
              placeholder="e.g., WP-CAB-1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              required
            />
          </div>

          <button className="primaryBtn" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Find"}
          </button>
        </form>
      </section>

      {/* Details and actions */}
      <section className="card">
        <h3 className="cardTitle">Vehicle Details</h3>

        {!vehicle ? (
          <div className="muted">No vehicle selected. Search above.</div>
        ) : (
          <div className="tableWrap">
            <table className="rv-table">
              <thead>
                <tr>
                  <th>vehicleID</th>
                  <th>vehicleNumber</th>
                  <th>vehicleType</th>
                  <th>date</th>
                  <th>entryTime</th>
                  <th>exitTime</th>
                  <th>duration (hrs)</th>
                  <th>slotID</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="idCell">{vehicle.vehicleID || vehicle._id}</td>
                  <td className="strong">{vehicle.vehicleNumber}</td>
                  <td className="cap">{vehicle.vehicleType}</td>
                  <td>{vehicle.date || "—"}</td>
                  <td>{vehicle.entryTime || "—"}</td>
                  <td>{vehicle.exitTime ?? "—"}</td>
                  <td>{vehicle.duration ?? "—"}</td>
                  <td>{vehicle.slotID ?? "—"}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
              <button
                className="primaryBtn"
                onClick={setExitAndCalculate}
                disabled={saving}
                title="Set exit time to now and compute duration on the server"
              >
                {saving ? "Saving…" : "Set Exit & Calculate"}
              </button>

              <button
                className="primaryBtn"
                style={{ background: "#0074D5" }}
                onClick={goToPayment}
                disabled={!vehicle?.duration}
                title="Open payment screen with this vehicleID"
              >
                Pay
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Visual badge to match the rest of the UI */}
      <div className="liveBadge">Live Updates Active</div>
    </div>
  );
}
