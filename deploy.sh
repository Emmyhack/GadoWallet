#!/bin/bash

# Gado Wallet Deployment Script
# This script handles the complete deployment process for the Gado Wallet

set -e

echo " Starting Gado Wallet Deployment..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v solana &> /dev/null; then
        print_error "Solana CLI not found. Please install it first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install it first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install it first."
        exit 1
    fi
    
    print_success "All dependencies found!"
}

# Generate a new program keypair
generate_program_keypair() {
    print_status "Generating new program keypair..."
    
    mkdir -p gada/target/deploy
    
    if [ ! -f "gada/target/deploy/gada-keypair.json" ]; then
        solana-keygen new --no-bip39-passphrase --outfile gada/target/deploy/gada-keypair.json --force
        print_success "Generated new program keypair"
    else
        print_warning "Program keypair already exists"
    fi
    
    PROGRAM_ID=$(solana-keygen pubkey gada/target/deploy/gada-keypair.json)
    print_success "Program ID: $PROGRAM_ID"
}

# Update program ID in configuration files
update_program_id() {
    local PROGRAM_ID=$1
    print_status "Updating program ID in configuration files..."
    
    # Update frontend configuration
    if [ -f "frontend/src/lib/publickey-utils.ts" ]; then
        sed -i.bak "s/8N4Mjyw7ThUFdkJ1LbrAnCzfxSpxknqCZhkGHDCcaMRE/$PROGRAM_ID/g" frontend/src/lib/publickey-utils.ts
        print_success "Updated frontend configuration"
    fi
    
    # Update Anchor configuration
    if [ -f "gada/Anchor.toml" ]; then
        sed -i.bak "s/8N4Mjyw7ThUFdkJ1LbrAnCzfxSpxknqCZhkGHDCcaMRE/$PROGRAM_ID/g" gada/Anchor.toml
        print_success "Updated Anchor configuration"
    fi
    
    # Update program lib.rs
    if [ -f "gada/programs/gada/src/lib.rs" ]; then
        sed -i.bak "s/8N4Mjyw7ThUFdkJ1LbrAnCzfxSpxknqCZhkGHDCcaMRE/$PROGRAM_ID/g" gada/programs/gada/src/lib.rs
        print_success "Updated program source"
    fi
    
    print_success "Program ID updated in all configuration files"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    print_status "Building frontend application..."
    npm run build
    
    cd ..
    print_success "Frontend built successfully!"
}

# Deploy to Vercel (requires authentication)
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        cd frontend
        vercel --prod --yes || print_warning "Vercel deployment failed - manual deployment may be required"
        cd ..
    else
        print_warning "Vercel CLI not found. Please deploy manually or install Vercel CLI"
        print_status "To deploy manually:"
        print_status "1. Install Vercel CLI: npm i -g vercel"
        print_status "2. Run: cd frontend && vercel --prod"
    fi
}

# Create deployment summary
create_summary() {
    local PROGRAM_ID=$1
    
    print_success " Deployment completed!"
    echo ""
    echo " Deployment Summary:"
    echo "======================="
    echo "Program ID: $PROGRAM_ID"
    echo "Network: Devnet"
    echo "Frontend: Built and ready for deployment"
    echo ""
    echo " Useful Links:"
    echo "Frontend build: ./frontend/dist/"
    echo "Program Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
    echo ""
    echo "  Next Steps:"
    echo "1. Deploy the Solana program to devnet (requires Anchor CLI)"
    echo "2. Deploy frontend to Vercel or your preferred hosting"
    echo "3. Test the application functionality"
}

# Main deployment process
main() {
    print_status " Starting Gado Wallet deployment process..."
    
    # Check dependencies
    check_dependencies
    
    # Generate program keypair and get program ID
    generate_program_keypair
    PROGRAM_ID=$(solana-keygen pubkey gada/target/deploy/gada-keypair.json)
    
    # Update program ID in all configuration files
    update_program_id "$PROGRAM_ID"
    
    # Build frontend
    build_frontend
    
    # Deploy to Vercel (optional)
    if [ "$1" = "--deploy-vercel" ]; then
        deploy_vercel
    fi
    
    # Create deployment summary
    create_summary "$PROGRAM_ID"
    
    print_success " Deployment process completed successfully!"
}

# Run main function with all arguments
main "$@"
