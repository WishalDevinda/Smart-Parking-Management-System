import React, { useState } from 'react'
import { api } from '../lib/api.js'

export default function LiveSlot(){
  const token = localStorage.getItem('token')
  const [at,setAt]=useState(()=> new Date().toISOString().slice(0,16))
  const [available,setAvailable]=useState([])
  const [reserved,setReserved]=useState([])

  const run = async ()=>{
    const data = await api(`/slots/search/at?at=${new Date(at).toISOString()}`,{token})
    setAvailable(data.available)
    setReserved(data.reserved)
  }

  return (
    <div>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:16}}>
        <div>Enter date & time</div>
        <input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} />
        <button className="btn olive" onClick={run}>Search</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
        <div>
          <div style={{fontWeight:700, marginBottom:8}}>Available Slots</div>
          <div className="grid cols-4">
            {available.map(s=> <div key={s._id} className="slot-tile">{s.slotId}</div>)}
          </div>
        </div>
        <div>
          <div style={{fontWeight:700, marginBottom:8}}>Reserved Slots</div>
          <div className="grid cols-4">
            {reserved.map(s=> <div key={s._id} className="slot-tile">{s.slotId}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}
