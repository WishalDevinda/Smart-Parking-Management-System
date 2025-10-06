import { useMemo, useState } from "react";
import "../styles/theme.css";
import api from "../services/api";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import Footer from "../components/Footer";

const VEHICLE_TYPES = ["Car", "Van", "Bike", "Truck", "Bus"];
const RES_TYPES = ["In-Parking", "Online"];

export default function EntryExitCounter() {
  const [tab, setTab] = useState("entry");

  return (
    <>
      <Header />

      <main className="layout">
        <SidebarNav />

        <section className="content">
          <div className="pills">
            <button
              className={`pill ${tab === "entry" ? "active" : ""}`}
              onClick={() => setTab("entry")}
            >
              Entry
            </button>

            <button
              className={`pill dark ${tab === "exit" ? "active" : ""}`}
              onClick={() => setTab("exit")}
            >
              Exit
            </button>
          </div>

          {tab === "entry" ? <EntryCard /> : <ExitCard />}

          <div style={{ height: 18 }} />
          {/* Online reservation search ONLY on Entry view */}
          {tab === "entry" && <CheckOnlineReservation />}

          <Footer />
        </section>
      </main>
    </>
  );
}

/* ------------------------------ ENTRY ------------------------------ */
function EntryCard() {
  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "Car",
    reservationType: "In-Parking",
  });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const canSubmit = useMemo(
    () =>
      form.vehicleNumber.trim().length >= 3 &&
      VEHICLE_TYPES.includes(form.vehicleType) &&
      RES_TYPES.includes(form.reservationType),
    [form]
  );

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setToast(null);
    if (!canSubmit) return;

    try {
      setBusy(true);
      const payload = {
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        vehicleType: form.vehicleType,
        reservationType: form.reservationType,
      };
      const { data } = await api.vehicles.register(payload);
      setToast({
        ok: true,
        msg: `Registered ✅ ID: ${data?.vehicle?.vehicleID || "created"}`,
      });
      setForm({
        vehicleNumber: "",
        vehicleType: "Car",
        reservationType: "In-Parking",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setToast({ ok: false, msg: `Failed: ${msg}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <form onSubmit={submit}>
        <div className="field">
          <div className="label">Vehicle Number</div>
          <input
            className="input"
            placeholder="e.g. CAC-1234"
            value={form.vehicleNumber}
            onChange={(e) =>
              update("vehicleNumber", e.target.value.toUpperCase())
            }
          />
        </div>

        <div className="row">
          <div className="field">
            <div className="label">Vehicle Type</div>
            <select
              className="select"
              value={form.vehicleType}
              onChange={(e) => update("vehicleType", e.target.value)}
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="label">Reservation Type</div>
            <select
              className="select"
              value={form.reservationType}
              onChange={(e) => update("reservationType", e.target.value)}
            >
              {RES_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn" disabled={!canSubmit || busy}>
          {busy ? "Registering..." : "Register"}
        </button>

        {toast && (
          <div className={`toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>
        )}
      </form>
    </div>
  );
}

/* ------------------------------ EXIT ------------------------------ */
function ExitCard() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [summary, setSummary] = useState(null); // holds the finished vehicle

  async function finish(e) {
    e.preventDefault();
    setToast(null);
    const num = vehicleNumber.trim().toUpperCase();
    if (num.length < 3) {
      setToast({ ok: false, msg: "Enter a valid Vehicle Number" });
      return;
    }
    try {
      setBusy(true);
      const { data } = await api.vehicles.finishByNumber(num);
      const v = data?.vehicle;
      setSummary(v || null); // show summary box
      setToast({
        ok: true,
        msg: `Finished ✅ ${v?.vehicleNumber ?? num}`,
      });
      setVehicleNumber("");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setToast({ ok: false, msg: `Failed: ${msg}` });
      setSummary(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="card">
        <form onSubmit={finish}>
          <div className="field">
            <div className="label">Vehicle Number</div>
            <input
              className="input"
              placeholder="e.g. CAC-1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            />
          </div>
          <button className="btn" disabled={!vehicleNumber || busy}>
            {busy ? "Saving..." : "Finish Parking"}
          </button>
          {toast && (
            <div className={`toast ${toast.ok ? "ok" : "err"}`}>
              {toast.msg}
            </div>
          )}
        </form>
      </div>

      {/* Parking Summary appears after finishing */}
      {summary && (
        <>
          <ParkingSummary v={summary} />
          <div className="center">
            <button
              className="btn btnXL"
              onClick={() => alert("Proceed to payment flow…")}
            >
              Pay
            </button>
          </div>
        </>
      )}
    </>
  );
}

function ParkingSummary({ v }) {
  const rows = [
    ["Vehicle ID", v?.vehicleID || "-"],
    ["Number", v?.vehicleNumber || "-"],
    ["Type", v?.vehicleType || "-"],
    ["Entry Time", v?.entryTime || "-"],
    ["Exit Time", v?.exitTime || "-"],
    ["Duration", v?.duration != null ? `${v.duration} min` : "-"],
  ];

  return (
    <div className="summaryBox">
      <div className="summaryTitle">Summery</div>
      <div className="summaryRows">
        {rows.map(([k, val]) => (
          <div className="summaryRow" key={k}>
            <div className="summaryKey">{k}:</div>
            <div className="summaryVal">{String(val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------- CHECK ONLINE RESERVATION (Entry only) ---------------------- */
function CheckOnlineReservation() {
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  async function fetchBooking() {
    setErr(null);
    setData(null);
    if (!id.trim()) {
      setErr("Enter reservation/booking ID");
      return;
    }
    try {
      setBusy(true);
      const res = await api.onlineBookings.getById(id.trim());
      setData(res.data);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setErr(msg || "Not found");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="searchBar">
        <div className="badge">Check Online Reservation</div>
        <input
          className="input"
          placeholder="Type reservation ID..."
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button className="btn" onClick={fetchBooking} disabled={busy}>
          {busy ? "..." : "🔍"}
        </button>
      </div>

      <div className="result">
        {!data && !err && <div className="small">No result yet.</div>}
        {err && <div className="err toast">{err}</div>}
        {data && <BookingPreview data={data} />}
      </div>
    </div>
  );
}

function BookingPreview({ data }) {
  const b = data.booking || data.reservation || data;
  const rows = [
    ["Booking ID", b?.id || b?._id || "-"],
    ["Vehicle Number", b?.vehicleNumber || "-"],
    ["Vehicle Type", b?.vehicleType || "-"],
    ["Entry Time", b?.entryTime || "-"],
    ["Exit Time", b?.exitTime || "-"],
    ["Duration (min)", b?.duration ?? "-"],
    ["Amount", b?.amount != null ? String(b.amount) : "-"],
    ["Status", b?.status || "-"],
  ];
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td style={{ padding: "8px", fontWeight: 700, width: "220px" }}>
              {k}
            </td>
            <td style={{ padding: "8px" }}>{String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
