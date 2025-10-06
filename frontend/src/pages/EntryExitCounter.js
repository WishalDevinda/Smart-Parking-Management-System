// src/pages/EntryExitCounter.js
import { useEffect, useMemo, useState } from "react";
import "../styles/theme.css";
import api from "../services/api";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import Footer from "../components/Footer";

const VEHICLE_TYPES = ["Car", "Van", "Bike", "Truck", "Bus"];
const RES_TYPES = ["In-Parking", "Online"];
const HW_TYPES = ["ESP32 Camera", "Ultrasonic Sensor", "Servo Motor"];

export default function EntryExitCounter() {
  // tabs: entry | exit | vehicles | hardware | hardwareManage | hardwareAdd | hardwareView
  const [tab, setTab] = useState("entry");
  const [hardwareViewId, setHardwareViewId] = useState(null);
  const [hardwareStartEdit, setHardwareStartEdit] = useState(false);
  const [hardwarePrevTab, setHardwarePrevTab] = useState("hardware");

  const openHardwareList = () => {
    setHardwareViewId(null);
    setHardwareStartEdit(false);
    setTab("hardware");
  };
  const openHardwareManage = () => {
    setHardwareViewId(null);
    setHardwareStartEdit(false);
    setTab("hardwareManage");
  };
  const openHardwareAdd = () => {
    setHardwareViewId(null);
    setHardwareStartEdit(false);
    setTab("hardwareAdd");
  };
  const openHardwareView = (id, startEdit = false) => {
    setHardwarePrevTab(tab); // remember origin (dashboard/manage/add)
    setHardwareViewId(id);
    setHardwareStartEdit(startEdit);
    setTab("hardwareView");
  };

  const isHardware =
    tab === "hardware" ||
    tab === "hardwareManage" ||
    tab === "hardwareAdd" ||
    tab === "hardwareView";
  const isCoreTabs = tab === "entry" || tab === "exit" || tab === "vehicles";

  return (
    <>
      <Header />
      <main className="layout">
        <SidebarNav
          onSelectTab={(t) => (t === "hardware" ? openHardwareList() : setTab(t))}
        />
        <section className="content">
          {/* Show only core pills in core tabs */}
          {isCoreTabs && (
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
              <button
                className={`pill ${tab === "vehicles" ? "active" : ""}`}
                onClick={() => setTab("vehicles")}
              >
                Vehicles
              </button>
            </div>
          )}

          {/* Hardware-only pills */}
          {isHardware && (
            <div className="pills">
              <button
                className={`pill ${tab === "hardware" ? "active" : ""}`}
                onClick={openHardwareList}
              >
                Dashboard
              </button>
              <button
                className={`pill ${tab === "hardwareManage" ? "active" : ""}`}
                onClick={openHardwareManage}
                style={{ marginLeft: 8 }}
              >
                Manage Hardware
              </button>
              <button
                className={`pill ${tab === "hardwareAdd" ? "active" : ""}`}
                onClick={openHardwareAdd}
                style={{ marginLeft: 8 }}
              >
                Add Hardware
              </button>
            </div>
          )}

          {/* Pages */}
          {tab === "entry" && <EntryCard />}
          {tab === "exit" && <ExitCard />}
          {tab === "vehicles" && <VehicleTableTab onBack={() => setTab("entry")} />}

          {tab === "hardware" && (
            <HardwareDashboardTab onOpen={(id) => openHardwareView(id)} />
          )}

          {tab === "hardwareManage" && (
            <HardwareManageTab
              onAdd={openHardwareAdd}
              onOpenEdit={(id) => openHardwareView(id, true)}
            />
          )}

          {tab === "hardwareAdd" && (
            <HardwareAddTab onCancel={openHardwareManage} onAdded={openHardwareManage} />
          )}

          {tab === "hardwareView" && hardwareViewId && (
            <HardwareDetailsTab
              hardwareID={hardwareViewId}
              startEdit={hardwareStartEdit}
              onBack={() => setTab(hardwarePrevTab)}
              onAfterDelete={openHardwareManage}
            />
          )}

          <div style={{ height: 18 }} />
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
      setForm({ vehicleNumber: "", vehicleType: "Car", reservationType: "In-Parking" });
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
            onChange={(e) => update("vehicleNumber", e.target.value.toUpperCase())}
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

        {toast && <div className={`toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>}
      </form>
    </div>
  );
}

/* ------------------------------- EXIT ------------------------------- */
function ExitCard() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [summary, setSummary] = useState(null);

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
      setSummary(v || null);
      setToast({ ok: true, msg: `Finished ✅ ${v?.vehicleNumber ?? num}` });
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

          {toast && <div className={`toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>}
        </form>
      </div>

      {summary && (
        <>
          <ParkingSummary v={summary} />
          <div className="center">
            <button className="btn btnXL" onClick={() => alert("Proceed to payment flow…")}>
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

/* --------------------------- VEHICLES TAB --------------------------- */
function VehicleTableTab({ onBack }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  async function load() {
    try {
      setBusy(true);
      setErr(null);
      const res = await api.vehicles.getAll();
      setData(res.data);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setErr(msg || "Failed to load vehicles");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const list = data?.vehicles || [];

  return (
    <div className="card">
      <div className="pills" style={{ marginTop: 0, marginBottom: 12 }}>
        <button type="button" className="pill dark" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="pill" onClick={load} disabled={busy}>
          {busy ? "Loading…" : "Refresh"}
        </button>
      </div>

      {err && <div className="toast err">{err}</div>}

      <div className="tableWrap">
        <table className="tableFix">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Number</th>
              <th>Type</th>
              <th>Date</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Duration (min)</th>
              <th>Reservation</th>
              <th>Slot</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && !busy ? (
              <tr>
                <td colSpan="9" className="small">No vehicles found.</td>
              </tr>
            ) : (
              list.map((v) => (
                <tr key={v._id}>
                  <td>{v.vehicleID || "-"}</td>
                  <td>{v.vehicleNumber || "-"}</td>
                  <td>{v.vehicleType || "-"}</td>
                  <td>{v.date || "-"}</td>
                  <td>{v.entryTime || "-"}</td>
                  <td>{v.exitTime || "-"}</td>
                  <td>{v.duration ?? "-"}</td>
                  <td>{v.reservationType || "-"}</td>
                  <td>{v.slotID || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------- HARDWARE DASHBOARD TAB ---------------------- */
function HardwareDashboardTab({ onOpen }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [list, setList] = useState([]);

  async function load() {
    try {
      setBusy(true);
      setErr(null);
      const { data } = await api.systemHardware.getAll();
      setList(data?.systemHardware || []);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setErr(msg || "Failed to load hardware");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <h2 className="hwTitle">Hardware Health Dashboard</h2>
      <div className="hwPanel">
        <div className="slotGrid">
          {list.map((h) => (
            <button
              key={h._id}
              className="slotCard"
              onClick={() => onOpen(h.hardwareID)}
            >
              <div className="slotName">{h.hardwareID || h.hardwareName}</div>
              <div className="slotImg" aria-hidden>🟦🟦</div>
              <div className="slotMeta">
                <div className="kv">
                  <span>Type:</span>&nbsp;<span className="v">{h.hardwareType || "-"}</span>
                </div>
                <div className="kv">
                  <span>Status:</span>&nbsp;
                  <span className={`v status ${
                    String(h.hardwareStatus).toLowerCase() === "active"
                      ? "active"
                      : "inactive"
                  }`}>
                    {h.hardwareStatus || "-"}
                  </span>
                </div>
                <div className="kv small">
                  <span>Implemented:</span>&nbsp;
                  <span className="v">{fmtDate(h.implementedDate || h.implementDate)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {busy && <div className="small" style={{ marginTop: 10 }}>Loading…</div>}
      {err && <div className="toast err">{err}</div>}
      {!busy && !err && list.length === 0 && (
        <div className="small" style={{ marginTop: 10 }}>No hardware yet.</div>
      )}
    </div>
  );
}

/* ---------------------- HARDWARE MANAGE TABLE TAB --------------------- */
function HardwareManageTab({ onAdd, onOpenEdit }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [list, setList] = useState([]);

  async function load() {
    try {
      setBusy(true);
      setErr(null);
      const { data } = await api.systemHardware.getAll();
      setList(data?.systemHardware || []);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setErr(msg || "Failed to load hardware");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this hardware?")) return;
    try {
      setBusy(true);
      await api.systemHardware.delete(id);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setErr(msg || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="pills" style={{ marginTop: 0, marginBottom: 12 }}>
        <button type="button" className="pill" onClick={onAdd}>
          Add Hardware
        </button>
        <button
          type="button"
          className="pill"
          onClick={load}
          disabled={busy}
          style={{ marginLeft: 8 }}
        >
          {busy ? "Loading…" : "Refresh"}
        </button>
      </div>

      {err && <div className="toast err">{err}</div>}

      <div className="tableWrap">
        <table className="tableFix">
          <thead>
            <tr>
              <th>Hardware ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Implemented</th>
              <th>Last Maintenance</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && !busy ? (
              <tr>
                <td colSpan="7" className="small">No hardware found.</td>
              </tr>
            ) : (
              list.map((h) => (
                <tr key={h._id}>
                  <td>{h.hardwareID || "-"}</td>
                  <td>{h.hardwareName || "-"}</td>
                  <td>{h.hardwareType || "-"}</td>
                  <td>{h.hardwareStatus || "-"}</td>
                  <td>{fmtDate(h.implementedDate || h.implementDate)}</td>
                  <td>{fmtDate(h.lastMaintenanceDate || h.lastMaintanceDate)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="pill"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => onOpenEdit(h.hardwareID)}
                        title="Update this hardware"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="pill danger"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => handleDelete(h.hardwareID)}
                        title="Delete this hardware"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------------------- HARDWARE ADD TAB -------------------------- */
function HardwareAddTab({ onCancel, onAdded }) {
  const [form, setForm] = useState({
    hardwareName: "",
    hardwareType: HW_TYPES[0],
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const canSubmit =
    form.hardwareName.trim().length >= 2 && HW_TYPES.includes(form.hardwareType);

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setBusy(true);
      setErr(null);

      // Opt-in to your frontend helpers if present
      const genId =
        typeof window !== "undefined" && window.hwHelpers?.generateHardwareID;
      const genDate =
        typeof window !== "undefined" && window.hwHelpers?.generateImplementedDate;

      const implemented = typeof genDate === "function" ? genDate() : undefined;
      const hid = typeof genId === "function" ? genId() : undefined;

      const payload = {
        hardwareName: form.hardwareName.trim(),
        hardwareType: form.hardwareType,
        hardwareStatus: "Active",
        implementedDate: implemented, // both spellings for compatibility
        implementDate: implemented,
        hardwareID: hid,
        lastMaintenanceDate: null,
        lastMaintanceDate: null,
      };
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      await api.systemHardware.add(payload);
      onAdded && onAdded();
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2.message;
      setErr(msg || "Add failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Add Hardware</h3>
      {err && <div className="toast err">{err}</div>}

      <form onSubmit={submit}>
        <div className="row">
          <div className="field">
            <div className="label">Hardware Name</div>
            <input
              className="input"
              value={form.hardwareName}
              onChange={(e) =>
                setForm((p) => ({ ...p, hardwareName: e.target.value }))
              }
              placeholder="e.g. Gate Camera #2"
            />
          </div>

          <div className="field">
            <div className="label">Type</div>
            <select
              className="select"
              value={form.hardwareType}
              onChange={(e) =>
                setForm((p) => ({ ...p, hardwareType: e.target.value }))
              }
            >
              {HW_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pills" style={{ marginTop: 8 }}>
          <button className="pill" type="submit" disabled={!canSubmit || busy}>
            {busy ? "Adding…" : "Add"}
          </button>
          <button
            type="button"
            className="pill dark"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------- HARDWARE DETAILS TAB ----------------------- */
function HardwareDetailsTab({ hardwareID, startEdit, onBack, onAfterDelete }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(!!startEdit);

  const [form, setForm] = useState({
    hardwareName: "",
    hardwareType: "",
    hardwareStatus: "",
    lastMaintenanceDate: "",
  });

  function fillForm(h) {
    setForm({
      hardwareName: h.hardwareName || "",
      hardwareType: h.hardwareType || "",
      hardwareStatus: h.hardwareStatus || "",
      lastMaintenanceDate:
        toYMD(h.lastMaintenanceDate || h.lastMaintanceDate || "") || "",
    });
  }

  async function load() {
    try {
      setBusy(true);
      setErr(null);
      const { data } = await api.systemHardware.getById(hardwareID);
      const item = data?.systemHardware || null;
      setData(item);
      if (item) fillForm(item);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setErr(msg || "Failed to load hardware");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardwareID]);

  async function doDelete() {
    if (!window.confirm("Delete this hardware?")) return;
    try {
      setBusy(true);
      await api.systemHardware.delete(hardwareID);
      onAfterDelete && onAfterDelete();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setErr(msg || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function doUpdate(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setErr(null);
      const payload = {
        hardwareName: form.hardwareName,
        hardwareType: form.hardwareType,
        hardwareStatus: form.hardwareStatus,
        lastMaintenanceDate: form.lastMaintenanceDate || null,
        lastMaintanceDate: form.lastMaintenanceDate || null,
      };
      await api.systemHardware.update(hardwareID, payload);
      setEdit(false);
      await load();
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2.message;
      setErr(msg || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="pills" style={{ marginTop: 0, marginBottom: 12 }}>
        <button type="button" className="pill dark" onClick={onBack}>
          ← Back
        </button>
        {!edit && (
          <>
            <button type="button" className="pill" onClick={() => setEdit(true)}>
              Update
            </button>
            <button
              type="button"
              className="pill danger"
              onClick={doDelete}
              disabled={busy}
            >
              Delete
            </button>
          </>
        )}
      </div>

      {err && <div className="toast err">{err}</div>}
      {busy && <div className="small">Loading…</div>}

      {data && !edit && (
        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: "4px 0 8px 0" }}>{data.hardwareID}</h3>
          <strong>{data.hardwareName}</strong>
          <div className="small">Type: {data.hardwareType}</div>
          <div className="small">
            Implemented: {fmtDate(data.implementedDate || data.implementDate)}
          </div>
          <div className="small">
            Last Maintenance: {fmtDate(data.lastMaintenanceDate || data.lastMaintanceDate)}
          </div>
          <div className="small">Status: {data.hardwareStatus}</div>
        </div>
      )}

      {data && edit && (
        <form onSubmit={doUpdate} style={{ marginTop: 8 }}>
          <div className="row">
            <div className="field">
              <div className="label">Hardware Name</div>
              <input
                className="input"
                value={form.hardwareName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hardwareName: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <div className="label">Hardware Type</div>
              <input
                className="input"
                value={form.hardwareType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hardwareType: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <div className="label">Status</div>
              <select
                className="select"
                value={form.hardwareStatus}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hardwareStatus: e.target.value }))
                }
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Faulty</option>
                <option>Maintenance</option>
              </select>
            </div>

            <div className="field">
              <div className="label">Last Maintenance Date</div>
              <input
                type="date"
                className="input"
                value={form.lastMaintenanceDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastMaintenanceDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="pills" style={{ marginTop: 8 }}>
            <button className="pill" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="pill dark"
              onClick={() => setEdit(false)}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* -------------------- CHECK ONLINE RESERVATION -------------------- */
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

/* ------------------------------- helpers ------------------------------- */
function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(+dt)) return "-";
  return dt.toISOString().slice(0, 10);
}
function toYMD(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(+dt)) return "";
  return dt.toISOString().slice(0, 10);
}
