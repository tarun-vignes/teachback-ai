# Teachback

**You've read it. Now teach it back.**

Teachback helps students notice gaps in their understanding by explaining a concept in their own words. It compares the explanation with their notes, returns source-linked feedback, asks a practice question, and creates a downloadable before-and-after learning receipt.

Built for [Build Your First AI App 2026](EVENT.md). Live prototype: [Try Teachback](https://teachback-ai-a8n3.onrender.com). Free hosting can take time to wake after inactivity.

Source repository: [tarun-vignes/teachback-ai](https://github.com/tarun-vignes/teachback-ai).

Ready for hosting: [Deploy on Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Ftarun-vignes%2Fteachback-ai). This opens deployment setup; it is not an already-live app. See [deployment instructions](docs/deployment.md).

## Run locally

Requires Node.js 22.19 or newer and npm. From this directory:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open **http://127.0.0.1:3030**. A labeled fixed sample walkthrough works without credentials. To assess your own notes using real AI, provide a server-side `GEMINI_API_KEY` environment variable, or copy the blank example:

```powershell
Copy-Item .env.example .env
# Edit .env to add your own key, then restart the server.
```

An existing environment key takes precedence over the optional file. Never commit your key. The default model is `gemini-3.5-flash-lite`; change `GEMINI_MODEL` if necessary. Obtain a key through [Google AI Studio](https://aistudio.google.com/apikey). Provider availability, terms, and quotas apply; this project does not guarantee free inference.

## Main workflow

1. Paste notes or import a TXT/text-based PDF. Inspect extracted text, particularly for multi-column PDFs.
2. Name a concept and explain it in your own words.
3. Agree to send the material to Gemini and request feedback.
4. Read supported points, points to revisit, and uncertainties alongside source passages.
5. Answer the practice question and rewrite the explanation.
6. Review the second assessment and download the learning receipt.

The sample button activates a **fixed walkthrough**, not AI. Changing the notes, topic, or explanation switches to live AI. Sample receipts explicitly say the student's response has not been assessed. Provider errors never silently fall back to sample feedback.

## How AI contributes

The Node server calls Gemini's [generateContent API](https://ai.google.dev/api/generate-content) with [structured JSON output](https://ai.google.dev/gemini-api/docs/structured-output). The model identifies meaningful points in the explanation, connects them to supplied passages, proposes a follow-up question, and reviews the revised explanation and practice answer.

The server validates field types, lengths, categories, and finding counts. Each finding must quote both the supplied notes and the student's actual explanation, allowing whitespace differences only. Missing or fabricated passages downgrade the finding to uncertain. The coach is instructed to treat missing facts and conflicting notes as uncertain. Quote matching verifies text presence; it cannot prove the model interpreted those passages correctly. Summaries, questions, and practice reflections remain model-generated and can be wrong.

No numerical grades, mastery scores, or long-term learning claims are generated. The receipt documents a single practice session.

## Architecture and privacy

- Plain HTML/CSS/JavaScript frontend; no framework or build step.
- Node.js HTTP server; model credentials stay server-side.
- Mozilla PDF.js extracts PDF text in the browser, using a locally served worker.
- Notes and responses stay in browser memory and request memory. This app has no database, analytics, local storage, or application content logs.
- With consent, the notes, topic, explanation, and subsequent practice material are sent to Google Gemini. Google's data handling terms apply; do not use sensitive documents.
- Reloading clears the session. Downloaded receipts remain wherever the user saves them.
- Requests have size/length limits, timeouts, same-origin checks, an intent header, and a small per-IP in-memory rate limit.

The server binds to loopback locally and `0.0.0.0` in production. The Render Blueprint supplies the deployment configuration and HTTPS hosting. In-memory safeguards limit concurrent calls and daily requests, but reset on restart and are not durable spending controls; set provider quotas before public use. See [hosting limits](docs/deployment.md). Uploaded text is treated as untrusted material in the model instructions; prompt injection and incorrect interpretations remain possible.

Limits: 24,000 characters of notes, 4,000 characters per explanation/answer, 5 MB files, and 30 PDF pages. No OCR, accounts, voice input, spaced repetition, or durable history in this version.

## Checks

```powershell
npm.cmd test
npm.cmd run check
npm.cmd audit
npm.cmd run check:browser
```

The 24 unit/integration checks cover provider failures, source/student grounding, input bounds, concurrency, request limits, UTF-8 transport and private-file protection without provider calls. `check:browser` runs 27 checks in Chrome/WebKit or 26 in Firefox with explicitly mocked AI. It requires installed Chrome/Edge by default; set `BROWSER_EXECUTABLE` for a nonstandard path or `TEST_BROWSER=firefox`/`webkit` after installing that engine. Reports go to ignored `artifacts/browser-results-<engine>.json`. See the [release audit](docs/release-audit.md) for real PDF tests, browser setup, the actual cold-start observation, live model cases, and physical-device/screen-reader limits. The [demo script](docs/demo-script.md) provides a presentation walkthrough.

## Credits and contribution

Original app interface, workflow, prompts, validation, example material, and documentation were developed with OpenAI Codex assistance. PDF.js is a Mozilla project under Apache-2.0; dependencies retain their licenses. Playwright, axe and pdf-lib are development/test tools. Public PDF test fixtures retain their original rights and are downloaded only to ignored local artifacts. Google Gemini supplies live inference. Typography uses installed system fonts; there are no third-party image assets.

Before submitting, add your own account of what you built, what you understand, and what you learned. No participant learning outcomes or user-study results are claimed here. See the [submission draft](docs/submission-draft.md).
