export const API_BASE = "http://localhost:5000"; // change if your backend uses a different URL/port

async function http(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  payments: {
    list: () => http("/payments"),
    create: (p) => http("/payments", { method: "POST", body: p }),
    del: (id) => http(`/payments/${id}`, { method: "DELETE" }),
    calculate: (vehicleID) =>
      http("/payments/calculate", { method: "POST", body: { vehicleID } }),
  },
  rates: {
    list: () => http("/rates"),
    create: (p) => http("/rates", { method: "POST", body: p }),
    del: (id) => http(`/rates/${id}`, { method: "DELETE" }),
  },
  extra: {
    list: () => http("/extracharges"),
    create: (p) => http("/extracharges", { method: "POST", body: p }),
    del: (id) => http(`/extracharges/${id}`, { method: "DELETE" }),
  },
  refunds: {
    list: () => http("/refunds"),
    create: (p) => http("/refunds", { method: "POST", body: p }),
    del: (id) => http(`/refunds/${id}`, { method: "DELETE" }),
  },
};
