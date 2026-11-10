# Teachback

**You've read it. Now teach it back.**

Teachback helps students notice gaps in their understanding by explaining a concept in their own words. It compares the explanation with their notes, returns source-linked feedback, asks a practice question, and creates a downloadable before-and-after learning receipt.

Built for [Build Your First AI App 2026](EVENT.md). Functional local prototype; no public deployment has been published yet.

Source repository: [tarun-vignes/teachback-ai](https://github.com/tarun-vignes/teachback-ai).

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

An existing environment key takes precedence over the optional file. Never commit your key. The default model is `gemini-3.1-flash-lite`; change `GEMINI_MODEL` if necessary. Obtain a key through [Google AI Studio](https://aistudio.google.com/apikey). Provider availability, terms, and quotas apply; this project does not guarantee free inference.

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

The server validates field types, lengths, categories, and finding counts. It checks that each quoted passage appears in the notes, allowing whitespace differences only. A missing, tiny, or fabricated quote downgrades a finding to uncertain and removes its unsupported explanation. Source matching verifies the presence of a passage; it cannot prove the model interpreted that passage correctly. Summaries, questions, and practice reflections remain model-generated and can be wrong.

No numerical grades, mastery scores, or long-term learning claims are generated. The receipt documents a single practice session.

## Architecture and privacy

- Plain HTML/CSS/JavaScript frontend; no framework or build step.
- Node.js HTTP server; model credentials stay server-side.
- Mozilla PDF.js extracts PDF text in the browser, using a locally served worker.
- Notes and responses stay in browser memory and request memory. This app has no database, analytics, local storage, or application content logs.
- With consent, the notes, topic, explanation, and subsequent practice material are sent to Google Gemini. Google's data handling terms apply; do not use sensitive documents.
- Reloading clears the session. Downloaded receipts remain wherever the user saves them.
- Requests have size/length limits, timeouts, same-origin checks, an intent header, and a small per-IP in-memory rate limit.

The server binds to loopback for local use. Public hosting requires a deployment configuration, HTTPS, suitable shared abuse controls, and an explicit privacy review. Do not expose this development server as-is. Uploaded text is treated as untrusted material in the model instructions; prompt injection and incorrect interpretations remain possible.

Limits: 24,000 characters of notes, 4,000 characters per explanation/answer, 5 MB files, and 30 PDF pages. No OCR, accounts, voice input, spaced repetition, or durable history in this version.

## Checks

```powershell
npm.cmd test
npm.cmd run check
npm.cmd audit
```

The automated tests cover evidence matching, invented citations, malformed output, and input limits without network calls. See [verification notes](docs/verification.md) for observed manual and live checks, and [demo script](docs/demo-script.md) for a presentation walkthrough.

## Credits and contribution

Original app interface, workflow, prompts, validation, example material, and documentation were developed with OpenAI Codex assistance. PDF.js is a Mozilla project under Apache-2.0; dependencies retain their licenses. Google Gemini supplies live inference. Typography uses installed system fonts; there are no third-party image assets.

Before submitting, add your own account of what you built, what you understand, and what you learned. No participant learning outcomes or user-study results are claimed here. See the [submission draft](docs/submission-draft.md).
