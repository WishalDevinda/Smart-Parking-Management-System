import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export default function Payments(){
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    paymentID:"", vehicleID:"", amount:"", extraAmount:"",
    paymentMethod:"cash", date: new Date().toISOString().slice(0,10),
    status:"pending"
  });

  const total = useMemo(()=> (Number(form.amount||0)+Number(form.extraAmount||0)).toFixed(2), [form.amount, form.extraAmount]);
  const load = async () => { const d = await api.payments.list(); setRows(d.Payments ?? []); };

  useEffect(()=>{ load(); },[]);
  const update = (k,v)=> setForm(p=>({...p,[k]:v}));

  async function save(e){
    e.preventDefault(); setSaving(true); setToast(null);
    try{
      await api.payments.create({
        paymentID: form.paymentID,
        amount: Number(form.amount),
        extraAmount: Number(form.extraAmount||0),
        total: Number(total),
        paymentMethod: form.paymentMethod,
        date: new Date(form.date),
        status: form.status,
      });
      setToast({t:"success", m:"Payment saved"});
      setForm({ paymentID:"", vehicleID:"", amount:"", extraAmount:"", paymentMethod:"cash", date:new Date().toISOString().slice(0,10), status:"pending" });
      await load();
    }catch{ setToast({t:"error", m:"Save failed"}); }
    finally{ setSaving(false); }
  }

  async function calc(){
    if(!form.vehicleID){ setToast({t:"warn", m:"Enter Vehicle ID first"}); return; }
    setCalculating(true); setToast(null);
    try{
      const { payment } = await api.payments.calculate(form.vehicleID);
      if(payment){
        update("amount", payment.amount ?? form.amount);
        update("extraAmount", payment.extraAmount ?? form.extraAmount);
        update("paymentMethod", payment.paymentMethod ?? form.paymentMethod);
        update("status", payment.status ?? form.status);
        update("date", (payment.date ? new Date(payment.date) : new Date()).toISOString().slice(0,10));
      }
      setToast({t:"success", m:"Calculated from vehicle"});
    }catch{ setToast({t:"error", m:"Calculation failed"}); }
    finally{ setCalculating(false); }
  }

  async function del(id){
    if(!confirm("Delete this payment?")) return;
    await api.payments.del(id);
    await load();
  }

  return (
    <>
      <h1 className="pageTitle">Payments</h1>
      {toast && <div className={`toast ${toast.t==="success"?"toastSuccess":toast.t==="warn"?"toastWarn":"toastError"}`}>{toast.m}</div>}

      <section className="card">
        <h2 className="cardTitle">Create / Calculate</h2>
        <form className="grid" onSubmit={save}>
          <div className="field">
            <label>Payment ID *</label>
            <input required value={form.paymentID} onChange={e=>update("paymentID", e.target.value)} placeholder="PMT-001" />
          </div>

          <div className="field">
            <label>Vehicle ID (optional calc)</label>
            <div className="inline">
              <input value={form.vehicleID} onChange={e=>update("vehicleID", e.target.value)} placeholder="Vehicle _id" />
              <button type="button" className="btnBlue" onClick={calc} disabled={calculating}>{calculating?"Calculating…":"Calculate"}</button>
            </div>
          </div>

          <div className="field">
            <label>Amount (LKR) *</label>
            <input required type="number" step="0.01" value={form.amount} onChange={e=>update("amount", e.target.value)} />
          </div>

          <div className="field">
            <label>Extra Amount (LKR)</label>
            <input type="number" step="0.01" value={form.extraAmount} onChange={e=>update("extraAmount", e.target.value)} />
          </div>

          <div className="field">
            <label>Payment Method</label>
            <select value={form.paymentMethod} onChange={e=>update("paymentMethod", e.target.value)}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={e=>update("date", e.target.value)} />
          </div>

          <div className="field">
            <label>Status</label>
            <div className="chips">
              {["pending","paid","failed"].map(s=>(
                <button type="button" key={s} className={`chip ${form.status===s?"chipActive":""}`} onClick={()=>update("status", s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="field totalBox">
            <label>Total (auto)</label>
            <div className="total">{total} LKR</div>
          </div>

          <div className="actions">
            <button className="btnPrimary" disabled={saving}>{saving?"Saving…":"Save Payment"}</button>
            <button type="button" className="btnGhost" onClick={()=>setForm({ paymentID:"", vehicleID:"", amount:"", extraAmount:"", paymentMethod:"cash", date:new Date().toISOString().slice(0,10), status:"pending"})}>Clear</button>
          </div>
        </form>
      </section>

      
    </>
  );
}
