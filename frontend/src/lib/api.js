const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export async function api(path, { method='GET', body, token }={}){
  const res = await fetch(`${API_BASE}${path}`,{
    method,
    headers:{
      'Content-Type':'application/json',
      ...(token?{Authorization:`Bearer ${token}`}:{})
    },
    body: body? JSON.stringify(body): undefined
  })
  if(!res.ok){
    const t = await res.text()
    throw new Error(t || res.statusText)
  }
  const ct = res.headers.get('content-type')||''
  return ct.includes('application/json')? res.json(): res.text()
}

export const sseUrl = `${API_BASE}/sse/subscribe`
