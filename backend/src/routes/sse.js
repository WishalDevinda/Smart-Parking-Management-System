import { Router } from 'express';
import { addClient } from '../sse/hub.js';

const router = Router();

router.get('/subscribe', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write('event: hello\n');
  res.write('data: {"ok":true}\n\n');
  addClient(res);
});

export default router;
