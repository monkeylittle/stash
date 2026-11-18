# Local tests

Browser tests (Playwright) for the built site. **Local only**: they are not run by the
GitHub Pages workflow and are not installed as a git hook. Run them yourself before committing.

    npm install
    npm run test:setup     # once: downloads the WebKit and Chromium browsers
    npm test               # builds the site, then runs everything
    npm run test:iphone    # iPhone (WebKit) only, includes the mobile menu tests

Projects: `iphone` (WebKit, iPhone 14 viewport, touch) and `desktop` (Chromium).
The site is built with `hugo` from your PATH into `.test-site/` (gitignored). To use the
CI version of Hugo: `HUGO=/path/to/hugo npm test`.

What is covered: every page loads (200, no JS or console errors, no failed requests, no broken
images, no horizontal scroll), internal links resolve, the mobile menu opens/is not covered/
navigates on every page, the desktop nav, the photo viewer, sponsor links opening in a new tab,
and the contact form wiring.

New pages: add them to `tests/pages.js` (news posts are picked up automatically).
