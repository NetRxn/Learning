# External Resources: PWA Architecture

## Core References

**web.dev PWA Learning Path** — https://web.dev/learn/pwa
Google's canonical PWA course. Comprehensive coverage of service workers, caching, installability, and capabilities. Best for digging into implementation details beyond the evaluation level.

**Workbox Documentation** — https://developer.chrome.com/docs/workbox
The primary reference for evaluating whether LLM-generated code uses Workbox correctly. Includes strategy recipes, migration guides, and API reference.

**MDN: Progressive Web Apps** — https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
Authoritative API documentation. Best for checking specific API compatibility (Can I Use) and correct usage.

## Tooling

**Serwist** — https://serwist.pages.dev
Next.js-focused service worker framework (replaced deprecated next-pwa). Declarative configuration, built on Workbox patterns. The recommended tool for Next.js static exports.

**PWA Builder** — https://www.pwabuilder.com
Microsoft's tool for auditing and packaging PWAs. Useful for generating manifests, testing installability, and packaging PWAs for app stores.

**Lighthouse** — Built into Chrome DevTools (Audits tab)
Performance and PWA audit tool. Run regularly during development. Target: all PWA checks pass, Performance > 90.

## Community

**r/progressive_web_apps** — https://reddit.com/r/progressive_web_apps
Active community for real-world PWA discussions, migration stories, and platform updates. Good for staying current on iOS changes.

**PWA Builder Blog** — https://blog.pwabuilder.com
Microsoft's PWA tooling blog. Ecosystem statistics, real-world adoption data, and platform update coverage.

**web.dev Blog** — https://web.dev/blog
Google's web platform blog. Covers new APIs, best practices, and case studies. Filter for PWA-related posts.

## Books & Deep Dives

**"Building Progressive Web Apps" by Tal Ater** (O'Reilly)
Practical guide focused on implementation. Good for moving from evaluation to building. Covers service worker patterns in depth.

**"Going Offline" by Jeremy Keith** (A Book Apart)
Short, focused book on offline-first design thinking. Good for understanding the UX perspective of offline strategy design.

## Platform Updates (Check Regularly)

**Safari Release Notes** — https://developer.apple.com/documentation/safari-release-notes
Critical for tracking iOS PWA capability changes. Safari updates can make previously-impossible features available.

**Chrome Platform Status** — https://chromestatus.com
Track new and upcoming web platform features relevant to PWAs (Background Sync improvements, File Handling API, etc.)
