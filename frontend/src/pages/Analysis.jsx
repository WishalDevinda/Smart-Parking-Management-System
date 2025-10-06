import React, { useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Analysis(){
  const token = localStorage.getItem('token')
  const [from,setFrom]=useState(()=>{
    const d = new Date(); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10)
  })
  const [to,setTo]=useState(()=> new Date().toISOString().slice(0,10))
  const [rows,setRows]=useState([])
  const [byHour,setByHour]=useState([])
  const [peakHour,setPeakHour]=useState(null)
  const [suggestMore,setSuggestMore]=useState(false)

  const run = async ()=>{
    const fromDate = new Date(from+'T00:00:00')
    const toDate = new Date(to+'T23:59:59')
    const data = await api(`/reports/analyze?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`,{token})
    setRows(data.result)
    setByHour(data.byHour)
    setPeakHour(data.peakHour)
    setSuggestMore(data.suggestMore)
  }

  const chartData = useMemo(()=> byHour.map((min,i)=>({hour:i,label:`${i}:00`, minutes:min})),[byHour])

  const download = async (kind)=>{
    const fromDate = new Date(from+'T00:00:00')
    const toDate = new Date(to+'T23:59:59')
    const url = `/reports/export.${kind}?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
    const res = await fetch((import.meta.env.VITE_API_BASE||'http://localhost:4000/api')+url, {
      headers:{ Authorization: `Bearer ${token}` }
    })
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `autoslot-report.${kind}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:16}}>
        <div>From</div>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <div>-</div>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} />
        <button className="btn accent" onClick={run}>Run usage</button>
        <button className="btn accent" onClick={run}>Run maintanance</button>
        <button className="btn" style={{background:'#ad6b18', color:'#fff'}} onClick={()=>download('csv')}>Export CSV</button>
        <button className="btn" style={{background:'#ad6b18', color:'#fff'}} onClick={()=>download('pdf')}>Export PDF</button>
      </div>

      <div className="grid cols-2" style={{alignItems:'start'}}>
        <div>
          <div className="card" style={{background:'#f0b243', color:'#000', fontWeight:700}}>Usage</div>
          <div style={{padding:'8px 0'}}>
            {rows.map(r=> (
              <div key={r.slotId} style={{display:'flex', justifyContent:'space-between', padding:'4px 0'}}>
                <div>{r.slotId}</div>
                <div>{r.usageMin} min</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card" style={{background:'#f0b243', color:'#000', fontWeight:700}}>Maintanance</div>
          <div style={{padding:'8px 0'}}>
            {rows.map(r=> (
              <div key={r.slotId} style={{display:'flex', justifyContent:'space-between', padding:'4px 0'}}>
                <div>{r.slotId}</div>
                <div>{r.maintenanceMin} min</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginTop:24}}>
        <div style={{height:260}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{top:10,right:20,left:0,bottom:0}}>
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="minutes" stroke="#ad6b18" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{background:'#d9bf9e', color:'#000'}}>
          <div style={{textAlign:'center', fontWeight:700}}>Peak Hour Analysis</div>
          <div style={{textAlign:'center', marginTop:20, fontSize:20, fontWeight:700}}>
            {peakHour!==null ? `${peakHour} : 00 - ${peakHour+1} : 00` : '—'}
          </div>
          <div className="card" style={{marginTop:24, background:'#d9bf9e', color:'#000', textAlign:'center'}}>
            {suggestMore ? 'consider add 5 more slots' : 'capacity is sufficient for now'}
          </div>
        </div>
      </div>
    </div>
  )
}
