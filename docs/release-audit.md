# Release audit — Teachback

Performed November 10, 2026. This expands the earlier [test matrix](test-matrix.md). Checks below are observed results; browser emulation is explicitly distinguished from physical-device and assistive-technology testing.

## Coverage and outcomes

| Area | Scope | Result |
| --- | --- | --- |
| Unit and HTTP integration | 24 checks, including source/student quote validation, provider failures, size limits, origins, request limits, concurrency, UTF-8 transport and private-file protection | Passed |
| Chrome | 27 browser checks | Passed |
| Firefox | 26 browser checks; Firefox does not support the mobile-context option used here | Passed |
| WebKit | 27 browser checks, including iPhone touch emulation | Passed |
| Real public PDFs | Three checks in each of Chrome, Firefox and WebKit | All nine passed |
| Real model behavior | Eight original cases; final model instructions rechecked in two batches | Results below |
| Idle-to-wake | Fresh anonymous browser reached Render's sleeping-service loading page, then Teachback | Passed; approximately 22.6 seconds in this observation |
| Dependencies | npm audit after installing test tools | Zero known vulnerabilities reported |

The 80 browser checks include validation, consent and revoked consent, provider outage/offline/non-JSON failure recovery, actual receipt file saving and contents, keyboard file selection, TXT/PDF uploads, corrupt/image-only/overlong files, page/file/character limits, sample labeling, stale assessment invalidation, markup escaping, duplicate submission prevention, simulated client timeout, stale receipt invalidation, 200% CSS zoom, enlarged body text, reduced motion, mobile widths, fresh sessions and axe accessibility checks.

AI is mocked explicitly in the repeatable browser suite. Real inference is tested separately; an API-shaped browser mock is never counted as real model success.

## Real-document checks

Used the public [Mozilla PDF.js academic-paper sample](https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf) and [Mozilla encrypted regression fixture issue3371](https://github.com/mozilla/pdf.js/blob/master/test/pdfs/issue3371.pdf).

- Imported two original pages of the real two-column paper, preserving their original fonts and text; the app extracted 11,532 characters and the expected title/section text.
- Rejected the encrypted fixture with the password-protection message while preserving existing notes.
- Rejected the complete paper when extracted text exceeded the application limit, preserving existing notes.
- Repeated all three cases in Chrome, Firefox and WebKit.

The fixtures are downloaded to ignored `artifacts/real-pdfs/`, not bundled or relicensed. Passing these documents does not guarantee correct reading order for every PDF. The app asks users to review extracted text; scanned PDFs require OCR elsewhere.

## Real model behavior and fixes

Tests sent only original examples to Gemini 3.5 Flash-Lite. They checked:

1. Correct explanation: supported findings without invented mistakes.
2. Mistaken explanation: revisit findings grounded in notes.
3. Unrelated notes: uncertain findings.
4. Notes missing the relevant fact: uncertain findings.
5. Instructions embedded inside the notes: the coach continued assessing the original claim rather than obeying them or claiming to reveal a key. One run supplied an unmatched source quote; server validation safely downgraded that finding to uncertain rather than presenting it as a supported correction.
6. Contradictory source sections: uncertainty that explained the conflict.
7. French notes/explanation: relevant feedback with verified accented student/source passages.
8. Wrong practice answer plus correct revised explanation: the practice error was called out separately from the supported revision.

The first expanded run exposed over-crediting of points absent from the explanation and a missing-information case incorrectly labeled as a correction. One contradictory-source request also encountered provider high demand. The fixes require a matching `studentQuote` alongside the source quotation, downgrade unverified student passages to uncertain, and explicitly prohibit treating absent information as contradiction or choosing a side in conflicting notes. These cases were rerun; test failures and provider availability are not treated as successful checks. Model judgments remain probabilistic; matching quotations proves text presence, not semantic correctness or lasting mastery.

## Additional issues fixed

- An HTTP chunk boundary could corrupt a multibyte UTF-8 character. Body bytes are now collected before decoding; a regression test splits an emoji across chunks.
- Editing a practice answer or revision left an old receipt visible. It now hides until the updated answers are assessed.
- Receipt scrolling ignored reduced-motion preferences. It now uses immediate scrolling when requested.
- Invalid daily-limit configuration no longer disables the intended cap accidentally.

## Accessibility and compatibility scope

Axe WCAG 2 A/AA and 2.1 A/AA found no violations in the populated sample/receipt state in all three tested engines. Keyboard file selection, programmatic labels, reduced motion, reflow widths of 320/390/768 pixels, CSS zoom, and Chrome Android/WebKit iPhone emulation passed. These are engine/emulation results, **not actual iPhone Safari, Android hardware, or screen-reader certification**. No physical devices, VoiceOver, NVDA, JAWS or TalkBack were available through this session's tools. Those remain explicit external checks; no automated substitute is described as equivalent.

## Idle-to-wake observation

A new anonymous Chrome context requested the hosted app after its long idle period. Its first response was HTTP 503 with the title `Render - Application loading`. It transitioned automatically to Teachback after 22,649 ms, `/healthz` returned 200, and `/api/status` confirmed the configured Gemini model. No manual refresh or deployment was used to wake it. This tests the actual loading-to-app path, not a timing guarantee. See [Render's documented free-service behavior](https://render.com/docs/free#spinning-down-on-idle).

## Reproducing checks

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run check
npm.cmd audit
npm.cmd run check:browser

# Download test-only browser builds into ignored local artifacts.
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/artifacts/browsers"
node node_modules/playwright-core/cli.js install firefox webkit
$env:TEST_BROWSER = 'firefox'
npm.cmd run check:browser
$env:TEST_BROWSER = 'webkit'
npm.cmd run check:browser

# Downloads public fixtures on first use; no private files or API key needed.
npm.cmd run check:pdf

# Explicitly opt into real provider calls; consumes quota.
$env:LIVE_AI = '1'
npm.cmd run check:live

# Only meaningful after the public service has actually gone idle.
npm.cmd run check:cold
```

Set `BROWSER_EXECUTABLE` when Chrome is installed elsewhere. Browser reports are in ignored `artifacts/browser-results-<engine>.json`; PDF checks, real-AI results and the cold-start observation also write ignored reports. No API key is saved in those reports. The provider fixture is loaded only by Node integration tests; normal server startup never imports it.
