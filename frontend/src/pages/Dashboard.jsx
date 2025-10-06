import React, { useEffect, useMemo, useState } from 'react'
import { api, sseUrl } from '../lib/api.js'

function SlotCard({ slot, token, onChange }){
  const [editing,setEditing]=useState(false)
  const [sid,setSid]=useState(slot.slotId)
  const call = async (p)=>{ await api(`/slots/${slot._id}${p}`,{method:'POST', token}); onChange&&onChange() }
  const del = async ()=>{ if(confirm('Delete slot?')){ await api(`/slots/${slot._id}`,{method:'DELETE', token}); onChange&&onChange() } }
  const save = async ()=>{ await api(`/slots/${slot._id}`,{method:'PUT', token, body:{slotId:sid}}); setEditing(false); onChange&&onChange() }
  return (
    <div className="card" style={{background:'#7f795f'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
        {editing ? (
          <input value={sid} onChange={e=>setSid(e.target.value)} />
        ) : (
          <div style={{fontWeight:700}}>{slot.slotId}</div>
        )}
        {editing ? (
          <div style={{display:'flex', gap:6}}>
            <button className="btn olive" onClick={save}>Save</button>
            <button className="btn" onClick={()=>{setEditing(false); setSid(slot.slotId)}}>Cancel</button>
          </div>
        ) : (
          <button className="btn accent" onClick={()=>setEditing(true)}>Edit</button>
        )}
      </div>
      <div className="grid">
        <button className="btn yellow" onClick={()=>call('/maintenance/start')}>Maintanance</button>
        <button className="btn green" onClick={()=>call('/maintenance/end')}>End Maintanance</button>
        <button className="btn green" onClick={()=>call('/checkin')}>check in</button>
        <button className="btn red" onClick={()=>call('/checkout')}>checkout</button>
        <div style={{display:'flex', gap:8}}>
          <button className="btn red" onClick={del}>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard(){
  const token = localStorage.getItem('token')
  const [slots,setSlots]=useState([])
  const [newId,setNewId]=useState('')
  const [q,setQ]=useState('')

  const load = async ()=>{ const data = await api(`/slots?q=${encodeURIComponent(q)}`,{token}); setSlots(data) }
  useEffect(()=>{ load() },[q])
  useEffect(()=>{
    const ev = new EventSource(sseUrl)
    const onAny = ()=> load()
    ev.addEventListener('slot_created', onAny)
    ev.addEventListener('slot_updated', onAny)
    ev.addEventListener('slot_deleted', onAny)
    ev.addEventListener('slot_changed', onAny)
    return ()=> ev.close()
  },[])

  const add = async ()=>{ if(!newId) return; await api('/slots',{method:'POST', token, body:{slotId:newId}}); setNewId(''); load() }

  return (
    <div>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <button className="btn accent">Slot</button>
        <div style={{display:'flex', gap:8}}>
          <input placeholder="Add slot ID" value={newId} onChange={e=>setNewId(e.target.value)} />
          <button className="btn olive" onClick={add}>Add slot</button>
        </div>
        <div style={{marginLeft:'auto', display:'flex', gap:8}}>
          <input placeholder="Search by ID" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
      </div>
      <div style={{display:'flex', gap:16, marginBottom:16}}>
        <div className="btn" style={{background:'#8b5e1a', color:'#fff'}}>Available:{slots.filter(s=>s.status==='available').length}</div>
        <div className="btn" style={{background:'#8b5e1a', color:'#fff'}}>Occupied:{slots.filter(s=>s.status==='occupied').length}</div>
        <div className="btn" style={{background:'#8b5e1a', color:'#fff'}}>Maintanance:{slots.filter(s=>s.status==='maintenance').length}</div>
      </div>
      <div className="grid cols-2">
        {slots.map(s=> <SlotCard key={s._id} slot={s} token={token} onChange={load} />)}
      </div>
    </div>
  )
}
