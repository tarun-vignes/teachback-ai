# Verification

Observed November 10, 2026.

Final expanded results and reproduction commands: [release audit](release-audit.md). It covers the larger API suite, Chrome/Firefox/WebKit browser runs, real PDFs, student-quote grounding, and an observed 22.6-second idle-to-wake transition. Earlier checks below are retained as history.

Expanded check: see the [test matrix](test-matrix.md). All 20 reproducible local browser checks passed after fixing keyboard upload, stale assessment state, retry recovery, download anchoring, and accessibility contrast/label findings. Actual receipt saving was confirmed in Chrome. Four additional live public AI cases passed: correct explanation, wrong practice answer, unrelated notes, and missing source information. Cold-start and device-specific limits are stated in the matrix.

Hosting preparation: nine tests now pass, including unknown-field stripping, health checks, private-file protection, rejection of incorrect/malformed origins, and enforcement of the daily limit before inference. Render Blueprint, production bind address, configured origin, two-call concurrency limit, and a per-process daily request limit are included.

Render confirmed public deployment at https://teachback-ai-a8n3.onrender.com. The initial Gemini 3.1 Flash-Lite request returned high demand. The default and Blueprint now use Gemini 3.5 Flash-Lite, verified with real inference. Provider high demand also occurred temporarily with the new model before successful hosted calls; switching models does not guarantee availability.

## Public workflow checks

- Render deployed the model update at commit `059b554`; `/api/status` confirmed `gemini-3.5-flash-lite` and `/healthz` returned HTTP 200.
- Completed a real browser session on the public app: explanation, two source-linked misconception findings, generated practice question, practice answer, revised explanation, and a live before/after receipt with supported findings and practice reflection.
- The labeled fixed-sample workflow also produced a receipt on the public app.
- The hosted PDF.js module loaded as version 6.5.438; requesting `/.env` returned HTTP 404.
- At a 390-pixel viewport the document had no horizontal overflow.
- The browser automation's native download event timed out, so an operating-system file save was not confirmed. Receipt export generation was checked separately through the generated text Blob.

## Earlier local checks

- Six automated tests passed: valid source matching, fabricated quote downgrade, short/missing quote rejection, whitespace normalization, malformed feedback rejection, and input bounds.
- JavaScript syntax checks passed for the server and frontend.
- Upgraded PDF.js after npm reported a security advisory in the initially resolved version. The final installed version is 6.5.438; npm reported zero vulnerabilities at installation.
- Local browser rendered the app and completed the labeled fixed-sample workflow through the learning receipt.
- A 390-pixel viewport check found no horizontal document overflow.
- Browser imported the local PDF.js module and successfully extracted an original one-page synthetic PDF through the app's file-input handler. Testing found a PDF.js cleanup API change; using the loading task's destroy method fixed it. Complex layouts, scanned PDFs, and the native file-picker dialog remain outside this check.
- A real server-side Gemini request and a live browser review using the inherited environment key returned two relevant findings with source passages verified against the supplied notes. No key was copied into the project.
- Earlier local revision requests encountered provider unavailability (a diagnostic request confirmed HTTP 503/high demand) and a subsequent timeout. The app displayed errors and preserved the answers. The complete hosted live flow subsequently passed as described above.
- All tests use synthetic/original study material. No educational impact or lasting mastery was measured.

Remaining before submission: broader real-world PDF/subject/device testing, demo capture, and participant-specific submission details. The in-memory local rate limit is not a distributed production abuse control.
