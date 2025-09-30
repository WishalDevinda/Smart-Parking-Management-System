// Purpose: One-page CRUD UI for System Hardware.
// Supports: create, list, fetch one by id, update, delete.

import { useEffect, useMemo, useState } from "react";
import { SystemHardwareAPI } from "../services/systemHardware";
import "../styles/systemHardware.css";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "MAINTENANCE"];

export default function SystemHardware() {
  // Create/Update form state
  const [form, setForm] = useState({ type: "", status: "ACTIVE", location: "" });
  const [editingId, setEditingId] = useState(null); // _id or hardwareID when editing

  // Table and view state
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // Lookup single item by id
  const [lookupId, setLookupId] = useState("");

  const canSubmit = useMemo(() => form.type.trim().length > 0, [form.type]);
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function loadAll() {
    try {
      setLoading(true);
      const data = await SystemHardwareAPI.list();
      setItems(Array.isArray(data?.hardware) ? data.hardware : []);
    } catch (e) {
      console.error(e);
      setItems([]);
      setToast({ t: "error", m: e.message || "Failed to load hardware list" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setToast(null);
    if (!canSubmit) {
      setToast({ t: "error", m: "Type is required." });
      return;
    }
    try {
      setBusy(true);
      await SystemHardwareAPI.create({
        type: form.type.trim(),
        status: form.status || "ACTIVE",
        location: form.location || null,
      });
      setToast({ t: "success", m: "Hardware created." });
      setForm({ type: "", status: "ACTIVE", location: "" });
      await loadAll();
    } catch (e) {
      setToast({ t: "error", m: e.message || "Create failed" });
    } finally {
      setBusy(false);
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editingId) return;
    setToast(null);
    if (!canSubmit) {
      setToast({ t: "error", m: "Type is required." });
      return;
    }
    try {
      setBusy(true);
      await SystemHardwareAPI.update(editingId, {
        type: form.type.trim(),
        status: form.status || "ACTIVE",
        location: form.location || null,
      });
      setToast({ t: "success", m: "Hardware updated." });
      setEditingId(null);
      setForm({ type: "", status: "ACTIVE", location: "" });
      await loadAll();
    } catch (e) {
      setToast({ t: "error", m: e.message || "Update failed" });
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item) {
    setEditingId(item._id || item.hardwareID);
    setForm({
      type: item.type || "",
      status: item.status || "ACTIVE",
      location: item.location || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ type: "", status: "ACTIVE", location: "" });
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this hardware?")) return;
    try {
      await SystemHardwareAPI.remove(id);
      setToast({ t: "success", m: "Hardware deleted." });
      await loadAll();
    } catch (e) {
      setToast({ t: "error", m: e.message || "Delete failed" });
    }
  }

  async function onLookup(e) {
    e.preventDefault();
    setToast(null);
    const id = lookupId.trim();
    if (!id) {
      setToast({ t: "error", m: "Enter an ID to fetch (hardwareID or _id)." });
      return;
    }
    try {
      setBusy(true);
      const data = await SystemHardwareAPI.get(id);
      const one = data?.hardware;
      if (!one) {
        setToast({ t: "error", m: "Not found." });
        return;
      }
      setItems((prev) => {
        const rest = Array.isArray(prev)
          ? prev.filter((x) => (x._id || x.hardwareID) !== (one._id || one.hardwareID))
          : [];
        return [one, ...rest];
      });
      setToast({ t: "success", m: "Fetched one hardware item." });
    } catch (e) {
      setToast({ t: "error", m: e.message || "Fetch failed" });
    } finally {
      setBusy(false);
    }
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.hardwareID, it._id, it.type, it.status, it.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, filter]);

  return (
    <div className="hw-page">
      {/* Header */}
      <header className="hw-header">
        <h1 className="hw-title">System Hardware</h1>
        <p className="hw-sub">Create, view, update, and delete hardware records</p>
      </header>

      {/* Create / Update form */}
      <section className="card">
        <h3 className="cardTitle">{editingId ? "Update Hardware" : "Register Hardware"}</h3>
        {toast && <div className={`toast ${toast.t}`}>{toast.m}</div>}

        <form className="hw-form" onSubmit={editingId ? onUpdate : onCreate}>
          <div className="row">
            <label>Type *</label>
            <input
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              placeholder="Camera, Sensor, Gate..."
              required
            />
          </div>

          <div className="row">
            <label>Status</label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <label>Location</label>
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="P1 North, Gate A..."
            />
          </div>

          <div className="actions">
            <button className="primaryBtn" type="submit" disabled={!canSubmit || busy}>
              {editingId ? (busy ? "Saving..." : "Save Changes") : busy ? "Saving..." : "Register"}
            </button>
            {editingId && (
              <button className="secondaryBtn" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Fetch one by ID */}
      <section className="card">
        <h3 className="cardTitle">Fetch One By ID</h3>
        <form className="lookup" onSubmit={onLookup}>
          <input
            className="lookupInput"
            placeholder="Enter hardwareID or _id"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
          />
          <button className="primaryBtn" disabled={busy} type="submit">
            {busy ? "Loading..." : "Fetch"}
          </button>
        </form>
      </section>

      {/* Table */}
      <section className="card">
        <div className="tableTop">
          <h3 className="cardTitle">Hardware List</h3>
          <input
            className="searchInput"
            placeholder="Search type / status / location / id..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="muted">Loading...</div>
        ) : (
          <div className="tableWrap">
            <table className="hw-table">
              <thead>
                <tr>
                  <th>hardwareID</th>
                  <th>_id</th>
                  <th>type</th>
                  <th>status</th>
                  <th>location</th>
                  <th>actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const idForOps = it._id || it.hardwareID;
                  return (
                    <tr key={idForOps}>
                      <td className="idCell">{it.hardwareID}</td>
                      <td className="mono">{it._id}</td>
                      <td className="strong">{it.type}</td>
                      <td className="cap">{it.status}</td>
                      <td>{it.location ?? "—"}</td>
                      <td className="rowActions">
                        <button className="linkBtn" onClick={() => startEdit(it)}>
                          Edit
                        </button>
                        <button className="linkBtn danger" onClick={() => onDelete(idForOps)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="center muted">
                      No hardware found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
