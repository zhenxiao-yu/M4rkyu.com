# SEO Checklist for m4rkyu.com

## Indexation
- [ ] Confirm `https://m4rkyu.com/robots.txt` allows crawling and references the XML sitemap.
- [ ] Verify the XML sitemap (`/sitemap.xml`) is reachable and includes all key routes (/, /about, /projects, /skills, /gallery, /blog, /contact, /sitemap).
- [ ] Ensure canonical URLs use `https://m4rkyu.com` across all pages and that there is no `noindex` meta tag on indexable routes.
- [ ] Confirm a single H1 per page (screen-reader heading provided) and meaningful H2/H3 structure for content sections.
- [ ] Validate navigation/footer links point to the top-level pages and use descriptive anchor text.

## Structured data
- [ ] Test Person, Organization, WebSite (SearchAction), WebPage, BreadcrumbList, and ContactPage schemas via Google Rich Results Test.
- [ ] If blog posts are added, include Article schema with headline, datePublished, author, and image.
- [ ] Confirm structured data uses absolute URLs (`https://m4rkyu.com/...`).

## Performance & UX
- [ ] Run Lighthouse (mobile + desktop) for Core Web Vitals, focusing on LCP and CLS; ensure media elements have dimensions.
- [ ] Verify preloads for hero media do not block rendering; lazy-load below-the-fold imagery.
- [ ] Check that the fixed navigation/footer do not obscure content on small screens; adjust padding as needed.

## Verification & analytics
- [ ] Add Google Search Console verification token to the `google-site-verification` meta tag in `index.html` and redeploy.
- [ ] Add Bing Webmaster Tools token to the `msvalidate.01` meta tag in `index.html` and redeploy.
- [ ] Submit `https://m4rkyu.com/sitemap.xml` in Search Console and Bing Webmaster Tools.
- [ ] Enable Vercel Analytics and Speed Insights for production (already included in `src/index.jsx`).

## Monitoring & crawl management
- [ ] After deployment, fetch and render the homepage in Search Console to confirm indexability.
- [ ] Track crawl errors or 404s; ensure `/project` and `/post` legacy routes remain reachable.
- [ ] Re-run schema validation after any content or navigation changes.

## Testing links
- Google Rich Results Test: https://search.google.com/test/rich-results?url=https://m4rkyu.com
- Schema Markup Validator: https://validator.schema.org/
- PageSpeed Insights: https://pagespeed.web.dev/report?url=https://m4rkyu.com
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly?url=https://m4rkyu.com

---

## Content plan for ranking "ZhenXiao Yu" / "Mark Yu"
1. **About page hero**: Include the name variants ("ZhenXiao Yu", "ZhenXiao (Mark) Yu", "Mark Yu") in the opening paragraph with a concise bio: Ontario-based software engineer specializing in full-stack platforms, creative technology, and interactive media.
2. **Projects → case studies**: For each flagship project, add a short problem/solution/outcome block, then link back to the About and Contact pages. Highlight measurable results (performance gains, user impact, tech stack).
3. **Contact section**: Keep a clear call-to-action with email/LinkedIn, plus reassurance about response times and availability (remote/hybrid, Eastern Time).
4. **Internal linking strategy**:
   - Home → Projects → individual case study anchors → About → Contact.
   - Blog posts link to related projects and the About page for author credibility.
   - Gallery items link to Projects when visual R&D inspired shipped features.
5. **External links strategy**:
   - Ensure LinkedIn, GitHub, Instagram, and YouTube profiles link back to `https://m4rkyu.com`.
   - Publish a pinned GitHub README and LinkedIn Featured link that points to the About page.
6. **Copy blocks to add**:
   - "About Mark Yu (ZhenXiao Yu)": 3–4 sentences summarizing mission, tech focus, and current availability.
   - "Signature projects": bullet list with results (metrics where possible) and tech used.
   - "Collaboration fit": bullet list for consulting, full-time, and open-source interests.
