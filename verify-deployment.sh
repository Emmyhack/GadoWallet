#!/bin/bash

# Gado Wallet Deployment Verification Script
# This script verifies that all deployment configurations are correct

set -e

echo "🔍 Verifying Gado Wallet Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Get the current program ID
get_program_id() {
    if [ -f "gada/target/deploy/gada-keypair.json" ]; then
        PROGRAM_ID=$(solana-keygen pubkey gada/target/deploy/gada-keypair.json)
    else
        PROGRAM_ID="8N4Mjyw7ThUFdkJ1LbrAnCzfxSpxknqCZhkGHDCcaMRE"
    fi
    echo "$PROGRAM_ID"
}

# Verify frontend configuration
verify_frontend_config() {
    print_status "Checking frontend configuration..."
    
    PROGRAM_ID=$(get_program_id)
    
    if [ -f "frontend/src/lib/publickey-utils.ts" ]; then
        if grep -q "$PROGRAM_ID" "frontend/src/lib/publickey-utils.ts"; then
            print_success "Frontend program ID is correctly configured"
        else
            print_error "Frontend program ID mismatch"
            return 1
        fi
    else
        print_error "Frontend configuration file not found"
        return 1
    fi
}

# Verify Anchor configuration
verify_anchor_config() {
    print_status "Checking Anchor configuration..."
    
    PROGRAM_ID=$(get_program_id)
    
    if [ -f "gada/Anchor.toml" ]; then
        if grep -q "$PROGRAM_ID" "gada/Anchor.toml"; then
            print_success "Anchor configuration is correct"
        else
            print_error "Anchor configuration program ID mismatch"
            return 1
        fi
    else
        print_error "Anchor.toml not found"
        return 1
    fi
}

# Verify program source
verify_program_source() {
    print_status "Checking program source..."
    
    PROGRAM_ID=$(get_program_id)
    
    if [ -f "gada/programs/gada/src/lib.rs" ]; then
        if grep -q "$PROGRAM_ID" "gada/programs/gada/src/lib.rs"; then
            print_success "Program source has correct program ID"
        else
            print_error "Program source program ID mismatch"
            return 1
        fi
    else
        print_error "Program source file not found"
        return 1
    fi
}

# Verify frontend build
verify_frontend_build() {
    print_status "Checking frontend build..."
    
    if [ -d "frontend/dist" ]; then
        if [ -f "frontend/dist/index.html" ]; then
            print_success "Frontend build exists and ready for deployment"
        else
            print_warning "Frontend build incomplete"
            return 1
        fi
    else
        print_warning "Frontend not built yet - run 'npm run build' in frontend directory"
        return 1
    fi
}

# Verify GitHub Actions workflows
verify_workflows() {
    print_status "Checking GitHub Actions workflows..."
    
    if [ -f ".github/workflows/deploy.yml" ]; then
        print_success "Frontend deployment workflow configured"
    else
        print_warning "Frontend deployment workflow missing"
    fi
    
    if [ -f ".github/workflows/solana-deploy.yml" ]; then
        print_success "Solana deployment workflow configured"
    else
        print_warning "Solana deployment workflow missing"
    fi
}

# Check program keypair
verify_program_keypair() {
    print_status "Checking program keypair..."
    
    if [ -f "gada/target/deploy/gada-keypair.json" ]; then
        PROGRAM_ID=$(solana-keygen pubkey gada/target/deploy/gada-keypair.json)
        print_success "Program keypair exists: $PROGRAM_ID"
    else
        print_error "Program keypair not found"
        return 1
    fi
}

# Check if program is deployed on devnet
check_program_deployment() {
    print_status "Checking program deployment on devnet..."
    
    PROGRAM_ID=$(get_program_id)
    
    if command -v solana &> /dev/null; then
        if solana account "$PROGRAM_ID" --url https://api.devnet.solana.com > /dev/null 2>&1; then
            print_success "Program is deployed on devnet"
        else
            print_warning "Program not yet deployed on devnet"
            print_status "Deploy with: cd gada && anchor deploy"
        fi
    else
        print_warning "Solana CLI not available - cannot check deployment status"
    fi
}

# Main verification process
main() {
    echo "🔍 Starting Gado Wallet deployment verification..."
    echo ""
    
    local errors=0
    
    # Run all checks
    verify_program_keypair || ((errors++))
    verify_frontend_config || ((errors++))
    verify_anchor_config || ((errors++))
    verify_program_source || ((errors++))
    verify_frontend_build || ((errors++))
    verify_workflows
    check_program_deployment
    
    echo ""
    echo "📋 Verification Summary:"
    echo "======================="
    
    PROGRAM_ID=$(get_program_id)
    echo "Program ID: $PROGRAM_ID"
    echo "Network: Devnet"
    echo "Errors found: $errors"
    
    if [ $errors -eq 0 ]; then
        print_success "✅ All critical checks passed! Deployment is ready."
        echo ""
        echo "🚀 Next steps:"
        echo "1. Deploy program: cd gada && anchor deploy"
        echo "2. Deploy frontend: cd frontend && vercel --prod"
        echo "3. Test the application"
    else
        print_error "❌ Found $errors error(s). Please fix before deploying."
        exit 1
    fi
}

# Run main function
main "$@"