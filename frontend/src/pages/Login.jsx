import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'

export default function Login(){
  const [username,setUsername]=useState('admin')
  const [password,setPassword]=useState('admin123')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault(); setError(''); setLoading(true)
    try{
      const data = await api('/auth/login',{method:'POST', body:{username,password}})
      localStorage.setItem('token', data.token)
      nav('/dashboard')
    }catch(err){ setError('Login failed') }
    finally{ setLoading(false) }
  }

  return (
    <div style={{maxWidth:420, margin:'60px auto', textAlign:'center'}}>
      <h2>Login</h2>
      <form className="grid" onSubmit={submit}>
        <input placeholder="User name" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn olive" disabled={loading}>{loading? 'Signing in...':'Login'}</button>
        {error && <div style={{color:'crimson'}}>{error}</div>}
      </form>
    </div>
  )
}
