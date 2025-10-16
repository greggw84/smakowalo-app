# Todos

## Completed ✅

- [x] Fixed slow panel loading (reduced session and API timeouts)
- [x] Fixed unstable login issues (disabled aggressive session refetching)
- [x] Added required phone number field to registration with validation
- [x] Fixed redirect loop on /panel page (added hasRedirected flag and server middleware)
- [x] **Pushed all changes to GitHub repository** ✅
- [x] Added server-side middleware for auth protection
- [x] **FIXED: All products showing same "wrap z kurczaka" data**
  - Replaced old product IDs (1-23) with correct IDs (50-74) from OpenCart
  - Each product now has unique name, description, instructions, ingredients
  - Removed generic fallback - no more "wrap z kurczaka" for new products
  - 18 unique products with full data matching shop.smakowalo.pl
- [x] **Successfully pushed to GitHub: greggw84/smakowalo-app**

## In Progress 🔄

- [x] **FIXING: Kreator not showing products after selecting diets**
  - Root cause: Scraper didn't track product categories properly
  - Solution: Modified scraper to track all categories per product
  - Added categories array to ScrapedProduct interface
  - Map OpenCart categories to diets array in API
  - Products can now belong to multiple categories (Keto + Wegańska, etc.)

## Pending ⏳

- [ ] Test kreator with different diet combinations
- [ ] Test all product detail pages to ensure unique data displays correctly
- [ ] Deploy latest changes to production
- [ ] Monitor production for any remaining issues
- [ ] Test registration with phone number field on production
- [ ] Verify panel page loads correctly without redirect loops on production
