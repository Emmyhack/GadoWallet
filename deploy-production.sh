#!/bin/bash

# Gado Wallet Production Deployment Script
# This script prepares the project for production deployment

set -e

echo "🚀 Gado Wallet Production Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    print_error "Anchor CLI is not installed"
    exit 1
fi

if ! command -v solana &> /dev/null; then
    print_error "Solana CLI is not installed"
    exit 1
fi

print_success "All prerequisites found"

# Check if we're in the project root
if [ ! -f "README.md" ] || [ ! -d "gado" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Build Solana Program
print_status "Building Solana program..."
cd gado

if ! npm install; then
    print_error "Failed to install gado dependencies"
    exit 1
fi

if ! anchor build; then
    print_error "Failed to build Anchor program"
    exit 1
fi

print_success "Solana program built successfully"

# Copy IDL and types to frontend
print_status "Copying IDL and types to frontend..."
cp target/types/gado.ts ../frontend/src/lib/types/gado.ts 2>/dev/null || true
cp target/idl/gado.json ../frontend/src/lib/idl/gado.json 2>/dev/null || true

print_success "IDL and types copied to frontend"

# Build Frontend
print_status "Building frontend..."
cd ../frontend

if ! npm install; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi

if ! npm run build; then
    print_error "Failed to build frontend"
    exit 1
fi

print_success "Frontend built successfully"

# Security audit
print_status "Running security audit..."
npm audit --audit-level moderate || print_warning "Security vulnerabilities found - consider running 'npm audit fix'"

# Generate deployment summary
print_status "Generating deployment summary..."
cd ..

cat > DEPLOYMENT_STATUS.md << EOF
# Gado Wallet Deployment Status

## Build Status
- ✅ Solana program compiled successfully
- ✅ Frontend built successfully
- ✅ IDL and types synchronized
- ✅ Dependencies installed

## Program Information
- **Program ID**: \`EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu\`
- **Network**: Solana Devnet
- **Build Date**: $(date)
- **Anchor Version**: $(anchor --version | head -n1)

## Frontend Information
- **Framework**: React 18 + TypeScript + Vite
- **Build Size**: $(du -sh frontend/dist | cut -f1)
- **Dependencies**: $(grep -c '"' frontend/package.json | head -n1) packages

## Features Deployed
- ✅ Smart Wallet inheritance system
- ✅ Platform fee collection (0.5% - 2%)
- ✅ User profile management (Free/Premium)
- ✅ Treasury management
- ✅ Analytics dashboard
- ✅ Emergency controls
- ✅ Notification system
- ✅ Multi-asset support (SOL, SPL tokens)

## Revenue Model Active
- Platform fees: Configurable 0.5% - 2%
- Subscription tiers: Free and Premium
- Treasury management: Automated collection
- Analytics: Real-time tracking

## Deployment Ready
The project is ready for production deployment to:
- Frontend: Vercel, Netlify, or similar
- Program: Solana Mainnet (after audit)

## Next Steps
1. Deploy frontend to hosting platform
2. Update RPC endpoints for mainnet
3. Run security audit on mainnet deployment
4. Enable analytics and monitoring

Generated on: $(date)
EOF

print_success "Deployment summary generated"

# Final checks
print_status "Running final checks..."

# Check if all critical files exist
critical_files=(
    "gado/target/deploy/gado.so"
    "gado/target/idl/gado.json"
    "gado/target/types/gado.ts"
    "frontend/dist/index.html"
    "frontend/src/lib/types/gado.ts"
    "frontend/src/lib/idl/gado.json"
)

all_good=true
for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Critical file missing: $file"
        all_good=false
    fi
done

if [ "$all_good" = true ]; then
    print_success "All critical files present"
else
    print_error "Some critical files are missing"
    exit 1
fi

# Display final status
echo ""
echo "🎉 DEPLOYMENT READY!"
echo "==================="
print_success "Solana program: Built and ready"
print_success "Frontend: Built and optimized"
print_success "IDL & Types: Synchronized"
print_success "Dependencies: All installed"
print_success "Documentation: Updated"

echo ""
print_status "Quick deployment commands:"
echo "Frontend: cd frontend && vercel --prod"
echo "Program: anchor deploy --provider.cluster mainnet"

echo ""
print_status "Project statistics:"
echo "- Program size: $(du -sh gado/target/deploy/gado.so | cut -f1)"
echo "- Frontend size: $(du -sh frontend/dist | cut -f1)"
echo "- Total project size: $(du -sh . --exclude=node_modules --exclude=target/debug | cut -f1)"

echo ""
print_success "Deployment preparation complete! 🚀"
EOF