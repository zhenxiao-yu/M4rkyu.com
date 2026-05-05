# Testing the Repository

Since PowerShell execution policy blocks npm, use one of these methods:

## Option 1: Batch File (Recommended)
Double-click or run in Command Prompt:
```
H:\Github\M4rkyu.com\test-build.bat
```

## Option 2: Command Prompt (cmd.exe)
```cmd
cd /d H:\Github\M4rkyu.com
npm install
npm run lint
npm run build
```

## Option 3: PowerShell with Bypass
```powershell
cd H:\Github\M4rkyu.com
powershell -ExecutionPolicy Bypass -Command "npm install"
powershell -ExecutionPolicy Bypass -Command "npm run lint"
powershell -ExecutionPolicy Bypass -Command "npm run build"
```

## Option 4: VS Code Terminal
Open in VS Code (Ctrl+`) and run:
```bash
npm install
npm run lint
npm run build
```

## What to Check

1. **Install** - Should complete without errors
2. **Lint** - May show warnings but should not fail
3. **Build** - Should create `dist/` folder with compiled files

## Environment Setup

Before testing, create your `.env` file:
```bash
copy .env.example .env
```

Then edit `.env` and add your Firebase configuration from:
https://console.firebase.google.com/project/m4rkyu-3f0ec/settings/general

## Expected Build Output

```
dist/
├── assets/
│   ├── index-XXXX.js
│   ├── index-XXXX.css
│   └── ...
├── index.html
└── ...
```

If build succeeds, you're ready to deploy!
