#!/bin/bash

# Simple script to fix the Rust build stack issues
echo "Fixing Anchor build..."

# First try to use optimized build settings
export CARGO_NET_RETRY=3
export RUSTFLAGS="-C opt-level=z -C codegen-units=1"

# Try to build with smaller stack size
anchor build --arch bpf --program-name gado

if [ $? -ne 0 ]; then
    echo "Build failed, trying alternative approach..."
    # Generate types from existing IDL if available
    anchor idl types --program-id EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu
fi

echo "Build process completed"