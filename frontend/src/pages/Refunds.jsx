import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Refunds(){
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    refundID:"", reason:"", date: new Date().toISOString().slice(0,10),
    amount:"", companyAmount:"", status:"pending"
  });
  const [toast, setToast] = useState(null);

  const load = async ()=>{ const d = await api.refunds.list(); setRows(d.refunds ?? []); };
  useEffect(()=>{ load(); },[]);
  const update = (k,v)=> setForm(p=>({...p,[k]:v}));

  async function save(e){
    e.preventDefault(); setToast(null);
    try{
      await api.refunds.create({
        refundID: form.refundID, reason: form.reason,
        date: new Date(form.date), amount: Number(form.amount),
        companyAmount: Number(form.companyAmount), status: form.status
      });
      setForm({ refundID:"", reason:"", date: new Date().toISOString().slice(0,10), amount:"", companyAmount:"", status:"pending" });
      await load();
      setToast({t:"success", m:"Refund saved"});
    }catch{ setToast({t:"error", m:"Save failed"}); }
  }
  async function del(id){ if(!confirm("Delete refund?")) return; await api.refunds.del(id); await load(); }

  return (
    <>
      <h1 className="pageTitle">Refunds</h1>
      {toast && <div className={`toast ${toast.t==="success"?"toastSuccess":"toastError"}`}>{toast.m}</div>}

      <section className="card">
        <h2 className="cardTitle">Create Refund</h2>
        <form className="grid" onSubmit={save}>
          <div className="field"><label>Refund ID *</label><input required value={form.refundID} onChange={e=>update("refundID", e.target.value)} placeholder="RF-001" /></div>
          <div className="field"><label>Reason *</label><input required value={form.reason} onChange={e=>update("reason", e.target.value)} placeholder="Duplicate charge…" /></div>
          <div className="field"><label>Date</label><input type="date" value={form.date} onChange={e=>update("date", e.target.value)} /></div>
          <div className="field"><label>Amount to Customer (LKR) *</label><input required type="number" step="0.01" value={form.amount} onChange={e=>update("amount", e.target.value)} /></div>
          <div className="field"><label>Company Amount (LKR)</label><input type="number" step="0.01" value={form.companyAmount} onChange={e=>update("companyAmount", e.target.value)} /></div>
          <div className="field">
            <label>Status</label>
            <div className="chips">
              {["pending","approved","rejected","paid"].map(s=>(
                <button type="button" key={s} className={`chip ${form.status===s?"chipActive":""}`} onClick={()=>update("status", s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="actions"><button className="btnPrimary">Save Refund</button></div>
        </form>
      </section>
    </>
  );
}
