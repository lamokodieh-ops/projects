# InLumine — local development

## Start the app

```bash
npm install
npm run db:setup
npm run dev
```

Open **http://localhost:3000** (not 3001).

If the page looks broken or sign-in fails:

```bash
# Stop any running dev server (Ctrl+C), then:
Remove-Item -Recurse -Force .next
npm run dev
```

## Demo login

- Alumni: `kwabena@example.com` / `Alumni123!`
- Admin: `admin@inlumine.presec.edu.gh` / `Admin123!`
