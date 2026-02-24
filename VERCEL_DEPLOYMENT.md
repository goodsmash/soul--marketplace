# 🚀 VERCEL DEPLOYMENT GUIDE

## ✅ PRE-DEPLOYMENT CHECKLIST

- [x] UI builds successfully (`npm run build`)
- [x] All TypeScript errors resolved
- [x] Contracts deployed on Base Mainnet
- [x] Git repository initialized

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Build the Project
```bash
cd ~/.openclaw/skills/soul-marketplace/ui
npm run build
```

**Expected output:** `dist/` folder created

### Step 2: Push to GitHub
```bash
cd ~/.openclaw/skills/soul-marketplace

# If not already on GitHub:
git remote add origin https://github.com/YOUR_USERNAME/soul-marketplace.git
git push -u origin master
```

### Step 3: Deploy to Vercel

**Option A: Via Web (Easiest)**
1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Select "soul-marketplace" repo
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `ui`
5. Click "Deploy"

**Option B: Via CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd ~/.openclaw/skills/soul-marketplace/ui
vercel --prod
```

---

## ⚙️ VERCEL CONFIGURATION

### Environment Variables (if needed)
```
VITE_SOUL_TOKEN_ADDRESS=0xd2565D67398Db41dfe88E7e826253756A440132a
VITE_MARKETPLACE_ADDRESS=0xd464cc6600F7Ce9Cac72b6338DadB217Da509306
```

### Build Settings
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Root Directory:** `ui` (if monorepo)

---

## 🔗 LIVE CONTRACTS (Base Mainnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| SoulToken | 0xd2565D67398Db41dfe88E7e826253756A440132a | [View](https://basescan.org/address/0xd2565D67398Db41dfe88E7e826253756A440132a) |
| Marketplace | 0xd464cc6600F7Ce9Cac72b6338DadB217Da509306 | [View](https://basescan.org/address/0xd464cc6600F7Ce9Cac72b6338DadB217Da509306) |

---

## 🎉 AFTER DEPLOYMENT

Your site will be live at:
- `https://soul-marketplace.vercel.app`
- Or your custom domain

### Test the Live Site:
1. Connect wallet (MetaMask, Rainbow, etc.)
2. Switch to Base Mainnet
3. Try minting a soul (0.00001 ETH)
4. Try listing your soul
5. Browse the marketplace

---

## 🛠️ TROUBLESHOOTING

### Build Fails?
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### TypeScript Errors?
```bash
# Check types
npx tsc --noEmit
```

### Wallet Not Connecting?
- Ensure you're on Base Mainnet
- Check contract addresses are correct
- Verify RPC endpoints work

---

## 📞 SUPPORT

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all env variables are set
3. Ensure contracts are on Base Mainnet
4. Test locally first: `npm run dev`

---

**Ready to deploy? Run the commands above! 🚀**
