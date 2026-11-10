# Test matrix

Checked November 10, 2026. These are bounded functional checks, not proof that every model response, PDF, browser, or accessibility configuration will work.

## Real AI on the public app

| Case | Observed result |
| --- | --- |
| Correct JavaScript explanation | All three findings were supported; it did not invent a misconception. |
| Deliberately wrong practice answer with a correct revision | Practice reflection explicitly flagged the wrong answer, while assessing the revised explanation separately as supported. |
| Unrelated geometry notes with a JavaScript claim | Finding was uncertain; response explained that the notes were unrelated rather than judging the claim from outside knowledge. |
| Notes about reassignment that omit object properties | Finding was uncertain and identified the missing information. |
| Incorrect explanation followed by correction | Earlier public session completed through source-linked feedback, practice, revision and a learning receipt. |

All four new checks above used live Gemini 3.5 Flash-Lite, not fixed sample feedback. Findings were inspected for meaning as well as source presence. AI behavior is probabilistic; repeat checks with more subjects before claiming broad reliability.

## Reproducible browser checks

Run `npm run check:browser` after `npm ci`. All **20** checks passed with installed Chrome, explicitly mocked AI responses, and an isolated local server without a key:

1. Empty material and missing consent cause no AI call.
2. Tab and Enter open the file chooser; cancellation works.
3. Review renders source-linked feedback and practice.
4. Empty practice/revision are rejected before a request.
5. Provider failure preserves feedback, practice text and revision for retry.
6. Offline and non-JSON service failures show understandable messages and retain the explanation.
7. Retrying produces a receipt; the browser saves a real TXT file and its contents match the session.
8. Revoking consent blocks a revision call.
9. Editing source material clears the previous assessment and receipt.
10. TXT import preserves the original text.
11. A valid synthetic text PDF extracts the original content.
12. A synthetic two-column PDF extracts both columns and prompts reading-order review.
13. A raster-only PDF reports missing text and preserves the prior notes.
14. A corrupt PDF fails, and a subsequent upload works.
15. Files above 5 MB, notes above 24,000 characters, and PDFs above 30 pages are rejected without replacing existing notes.
16. Unsupported file types are rejected.
17. Sample mode is labeled, works without consent, and makes no inference calls.
18. Keyboard controls have labels and axe WCAG 2 A/AA and 2.1 A/AA reports zero violations in the populated sample/receipt page state.
19. Page widths of 320, 390 and 768 pixels have no horizontal overflow.
20. A new browser context starts with no previous study session and correctly indicates missing-key configuration.

The browser report and downloaded test receipt are stored only under ignored `artifacts/`. Synthetic PDFs are generated in memory; no private documents are bundled.

## Fixes resulting from testing

- Replaced the mouse-only upload label with a native keyboard-accessible button.
- Clear stale assessment/receipt state when notes, topic or explanation change, including imports and loading a sample.
- Keep the previous practice section available if a repeated review request fails.
- Added understandable offline/non-JSON error messages.
- Reset the file input after selection so failed files can be selected again; clean up failed PDF loading tasks.
- Added an explicit message for password-protected PDFs.
- Attach the download anchor to the document before triggering the file save.
- Darkened secondary text and corrected the brand link's accessible name to resolve the axe findings.

## Limits and cold-start behavior

- Original synthetic one-column, two-column and raster-only PDFs were tested. Arbitrary real-world academic layouts, fonts and encrypted PDFs have not all been exercised. No OCR is provided; imported reading order must be inspected.
- Chrome was tested. Real iOS Safari, Android devices and screen readers were not used. An axe pass is not full accessibility certification.
- A fresh anonymous visitor was checked. The Render loading screen was observed transitioning to the application during initial service startup. A separate 15-minute idle-to-wake cycle was not deliberately repeated, and no cold-start timing guarantee is claimed.
- Real provider high-demand errors and timeouts were observed earlier, including successful later requests. Mocked failures make retry testing repeatable without relying on an actual outage.
- Local browser receipt saving is now verified. The integrated-browser download event previously timed out; its public-page export Blob was separately verified.
- No learning-outcome study was performed. A corrected answer documents that session only.
