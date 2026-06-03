'use strict';

const getDocsIndex = (services) => (req, res) => {
  res.json({
    service: 'api-gateway',
    message: 'Common Swagger documentation index for all microservices.',
    gatewayDocs: `${req.protocol}://${req.get('host')}/docs/gateway`,
    docs: services.map((service) => ({
      service: service.name,
      route: service.prefix,
      docs: `${service.target}/docs`,
    })),
  });
};

const getDocsPage = (services) => (req, res) => {
  const cards = [
    { name: 'API Gateway', route: '/docs/gateway', docs: '/docs/gateway' },
    ...services.map((service) => ({
      name: service.name,
      route: service.prefix,
      docs: `${service.target}/docs`,
    })),
  ];

  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FEMS API Documentation</title>
  <style>
    @font-face {
      font-family: 'Satoshi Variable';
      src: local('Satoshi Variable');
      font-weight: 300 900;
      font-display: swap;
    }
    body {
      margin: 0;
      font-family: 'Satoshi Variable', sans-serif;
      background: #f7f8fb;
      color: #1f2937;
    }
    .shell { max-width: 1120px; margin: 0 auto; padding: 56px 28px; }
    .eyebrow { color: #c62828; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 10px 0 12px; font-size: 42px; line-height: 1.05; letter-spacing: -.035em; }
    p { margin: 0; color: #5f6b7a; font-size: 16px; line-height: 1.7; max-width: 720px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; margin-top: 36px; }
    .card { background: #fff; border: 1px solid #e4e7ee; border-radius: 18px; padding: 22px; box-shadow: 0 16px 36px rgba(15, 23, 42, .08); }
    .card h2 { margin: 0 0 8px; font-size: 18px; letter-spacing: -.015em; }
    .route { color: #5f6b7a; font-size: 13px; margin-bottom: 18px; }
    a { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0 16px; border-radius: 12px; background: #c62828; color: #fff; text-decoration: none; font-weight: 700; font-size: 14px; }
    a.secondary { background: #fff1f1; color: #c62828; }
  </style>
</head>
<body>
  <main class="shell">
    <div class="eyebrow">FEMS Documentation</div>
    <h1>Common Swagger Center</h1>
    <p>Use this single gateway page to access the API Gateway Swagger and every microservice Swagger endpoint.</p>
    <section class="grid">
      ${cards.map((card, index) => `
        <article class="card">
          <h2>${card.name}</h2>
          <div class="route">${card.route}</div>
          <a class="${index === 0 ? '' : 'secondary'}" href="${card.docs}">Open Swagger</a>
        </article>
      `).join('')}
    </section>
  </main>
</body>
</html>`);
};

const getHealth = (req, res) => {
  res.json({ service: 'api-gateway', status: 'ok', timestamp: new Date().toISOString() });
};

module.exports = { getDocsIndex, getDocsPage, getHealth };
