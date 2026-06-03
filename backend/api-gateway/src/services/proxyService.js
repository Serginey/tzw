'use strict';
const http = require('http');
const https = require('https');

const proxyTo = (target) => (req, res) => {
  const targetUrl = new URL(req.originalUrl, target);
  const client = targetUrl.protocol === 'https:' ? https : http;
  const headers = { ...req.headers, host: targetUrl.host };
  delete headers.origin;

  const proxyReq = client.request({
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: `${targetUrl.pathname}${targetUrl.search}`,
    method: req.method,
    headers,
  }, (proxyRes) => {
    res.status(proxyRes.statusCode || 502);
    Object.entries(proxyRes.headers).forEach(([key, value]) => {
      if (value !== undefined) res.setHeader(key, value);
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    if (!res.headersSent) res.status(502).json({ success: false, message: 'Service unavailable.' });
  });

  req.pipe(proxyReq);
};

module.exports = { proxyTo };
