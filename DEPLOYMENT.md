# GadaWallet Deployment Guide

## Vercel Deployment

This project is configured to deploy the React/Vite frontend to Vercel.

### Configuration Files

- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to exclude from deployment

### Build Process

1. **Install Dependencies**: `cd gada/frontend && npm install`
2. **Build Application**: `npm run build`
3. **Output Directory**: `gada/frontend/dist`

### Key Configuration

- **Framework**: Vite
- **Build Command**: `cd gada/frontend && npm install && npm run build`
- **Output Directory**: `gada/frontend/dist`
- **SPA Routing**: Configured with rewrites for client-side routing

### Troubleshooting

If you encounter the "vitepress: command not found" error:
- This happens when Vercel is configured for VitePress instead of Vite
- The `vercel.json` file fixes this by specifying the correct build commands
- Ensure the `vercel.json` file is in the root directory

### Local Testing

To test the build locally:

```bash
cd gada/frontend
npm install
npm run build
```

The build should complete successfully with the output in `gada/frontend/dist/`.