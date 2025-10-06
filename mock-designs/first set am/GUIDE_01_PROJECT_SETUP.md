# Guide 01: Project Setup & Folder Structure

**Estimated Time:** 30 minutes  
**When:** Tonight (Quick setup before tomorrow's coding session)

---

## 🎯 Goal

Set up the project foundation with all dependencies and proper folder structure. After this step, you'll have a clean slate ready for building.

---

## 📦 Step 1: Install Dependencies

```bash
cd /Users/jamesfinkelstein/github.com/loblaw-ui-test-js

# Install routing and state management
npm install react-router-dom @reduxjs/toolkit react-redux

# Verify installation
npm list react-router-dom @reduxjs/toolkit react-redux
```

**What we're adding:**
- `react-router-dom` - For page navigation (Campaign List ↔ Dashboard)
- `@reduxjs/toolkit` - Modern Redux (our ONE advanced showcase)
- `react-redux` - React bindings for Redux

---

## 📁 Step 2: Create Folder Structure

```bash
# From project root
mkdir -p src/store
mkdir -p src/services
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/test/integration
```

**Folder Purpose:**
```
src/
├── store/              # Redux state management
│   ├── index.js        # Store configuration
│   └── campaignsSlice.js
│
├── services/           # API layer + validation
│   ├── campaignService.js
│   └── validation.js
│
├── components/         # Reusable UI components
│   ├── MetricCard.jsx
│   ├── ErrorBanner.jsx
│   └── Layout.jsx
│
├── pages/              # Route components
│   ├── CampaignListPage.jsx
│   └── DashboardPage.jsx
│
└── test/
    └── integration/    # End-to-end flow tests
        └── campaignFlow.test.jsx
```

---

## 🗂️ Step 3: Verify Existing MSW Setup

Check that MSW mocking is already configured:

```bash
# Should see these files:
ls src/mocks/
# Expected: browser.js, handlers.js

ls public/
# Expected: mockServiceWorker.js

# Check if MSW is in package.json
cat package.json | grep msw
# Expected: "msw": "^2.3.5"
```

**If these exist → Good! MSW is ready.**  
**If missing → Something's wrong, but unlikely based on README.**

---

## 📝 Step 4: Create Initial Placeholder Files

Create empty placeholder files so you can verify structure:

```bash
# Store files
touch src/store/index.js
touch src/store/campaignsSlice.js

# Service files
touch src/services/validation.js
touch src/services/campaignService.js

# Component files
touch src/components/MetricCard.jsx
touch src/components/ErrorBanner.jsx
touch src/components/Layout.jsx

# Page files
touch src/pages/CampaignListPage.jsx
touch src/pages/DashboardPage.jsx

# Integration test
touch src/test/integration/campaignFlow.test.jsx
```

---

## ✅ Step 5: Verification

Run these commands to verify setup:

```bash
# 1. Check dependencies installed
npm list react-router-dom @reduxjs/toolkit react-redux

# 2. Verify folder structure
tree src -L 2
# or
ls -R src

# 3. Check that existing tests still work
npm test

# 4. Verify dev server still runs
npm start
# Should open http://localhost:5173 with "Good Luck!" message
```

---

## 🎯 Success Criteria

Before moving to Guide 02, confirm:

- [ ] All npm packages installed without errors
- [ ] Folder structure matches diagram above
- [ ] Placeholder files created
- [ ] Existing MSW setup intact
- [ ] `npm test` runs (even if some tests fail - that's expected)
- [ ] `npm start` works and shows the app

---

## 🚀 Next Steps

**After completing this guide:**
- ✅ You have a clean, organized project structure
- ✅ All dependencies are installed
- ✅ Ready to start implementing Redux store (Guide 02)

**Tomorrow morning after gym:** Start with Guide 02 - Redux Store Setup

---

## 💡 Pro Tips

1. **Don't skip verification** - Each "npm test" and "npm start" check ensures nothing broke
2. **Keep terminal open** - You'll be switching between guides, stay in the project directory
3. **Commit after this step** - `git commit -m "Setup: Added dependencies and folder structure"`

---

## 🐛 Troubleshooting

**Problem:** `npm install` fails with peer dependency warnings  
**Solution:** Use `npm install --legacy-peer-deps` if needed

**Problem:** Folder creation fails  
**Solution:** Make sure you're in the project root: `pwd` should show `.../loblaw-ui-test-js`

**Problem:** MSW files missing  
**Solution:** Check the README - MSW should already be set up. If not, run `npx msw init public/`

---

**Estimated Completion Time:** 20-30 minutes  
**Ready for next guide?** Guide 02 - Redux Store Setup
