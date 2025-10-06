const clients = new Set();

export function sseMiddleware(req, res, next) {
  req.sse = {
    broadcast: (event, data) => {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      for (const res of clients) {
        res.write(payload);
      }
    }
  };
  next();
}

export function addClient(res) {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}
