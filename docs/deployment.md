# Deploy Teachback on Render

The repository contains a free Node web-service Blueprint. The application serves both the frontend and API; a static-only host cannot run the AI endpoint.

1. Sign in to [Render](https://dashboard.render.com/).
2. Open [Deploy Teachback](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Ftarun-vignes%2Fteachback-ai).
3. Review the Blueprint. Keep the **Free** instance plan. Connect GitHub if requested.
4. Enter your own `GEMINI_API_KEY` in Render's secret environment field, not in source or chat. This is sent only by the server to Google Gemini.
5. Apply the Blueprint and wait for a successful deployment and health check.
6. Open the actual URL Render assigns. `RENDER_EXTERNAL_URL` automatically sets the allowed browser origin. For a custom domain set `APP_ORIGIN` to its exact HTTPS origin without a trailing slash.
7. Verify the sample walkthrough, then edit the explanation to exit sample mode and exercise real AI with explicit consent. Complete a practice question and revision, then download the receipt.

Manual settings if Blueprint import is unavailable: repository `tarun-vignes/teachback-ai`, branch `main`, runtime Node, build `npm ci --omit=dev && npm test && npm run check`, start `npm start`, health path `/healthz`, Node `22.19.0`, `NODE_ENV=production`, and private `GEMINI_API_KEY`. The server binds to `0.0.0.0` in production and uses Render's `PORT`.

## Operating limits

- Free hosting can sleep while idle and take time to wake. Provider demand and quota can also delay or reject AI calls.
- There are no accounts or stored study records. Render and Google have their own service and logging policies. Avoid sensitive material in public demonstrations.
- Server safeguards: two concurrent AI calls, 200 attempted AI calls per UTC day per process by default, an eight-request/minute per connection-address limit, bounded input sizes, and 45-second provider timeouts. On a reverse proxy multiple visitors may share an address. The daily counter resets on restart or deployment; it is **not a durable spending cap**. Set actual quota/billing limits with Google and keep the key scoped appropriately.
- Raise or lower `MAX_DAILY_REVIEWS` deliberately. Multiple instances would need shared limits before scaling. The Blueprint uses a single free instance.
- Disable AI by removing the server key or suspend the service to stop further inference. The fixed sample walkthrough requires no provider requests.

No public URL is claimed until Render confirms a successful deployment.
