#!/bin/bash

echo "=== GadoWallet Logo Update Script ==="
echo ""
echo "🔗 Your logo link: https://drive.google.com/file/d/1sb2G5hw3ZOCDRGHLuFw249uQzD4zp-Ow/view?usp=drivesdk"
echo ""

show_help() {
    echo "Usage: ./update-logo.sh [command]"
    echo ""
    echo "Commands:"
    echo "  help      - Show this help message"
    echo "  install   - Install new logo (requires new-logo.png in current directory)"
    echo "  download  - Show download instructions"
    echo "  status    - Show current logo status"
    echo "  backup    - Create backup of current logo"
    echo "  restore   - Restore from backup"
    echo ""
}

download_instructions() {
    echo "📥 Download Instructions:"
    echo ""
    echo "1. Open the Google Drive link in your browser:"
    echo "   https://drive.google.com/file/d/1sb2G5hw3ZOCDRGHLuFw249uQzD4zp-Ow/view?usp=drivesdk"
    echo ""
    echo "2. Click the download button (⬇️) in the top-right corner"
    echo ""
    echo "3. Save the file as 'new-logo.png' in this directory:"
    echo "   $(pwd)"
    echo ""
    echo "4. Run: ./update-logo.sh install"
    echo ""
}

show_status() {
    echo "📊 Logo Status:"
    echo ""
    if [ -f "public/logo.png" ]; then
        echo "✅ Current logo: public/logo.png exists"
        echo "   Size: $(du -h public/logo.png | cut -f1)"
        echo "   Modified: $(stat -c %y public/logo.png)"
    else
        echo "❌ Current logo: public/logo.png not found"
    fi
    
    if [ -f "public/logo-backup.png" ]; then
        echo "💾 Backup logo: public/logo-backup.png exists"
    else
        echo "💾 Backup logo: No backup found"
    fi
    
    if [ -f "new-logo.png" ]; then
        echo "🆕 New logo: new-logo.png ready for installation"
        echo "   Size: $(du -h new-logo.png | cut -f1)"
    else
        echo "🆕 New logo: new-logo.png not found"
    fi
    echo ""
}

install_logo() {
    if [ -f "new-logo.png" ]; then
        echo "🔧 Installing new logo..."
        
        # Create backup if current logo exists
        if [ -f "public/logo.png" ]; then
            cp public/logo.png public/logo-backup.png
            echo "📄 Current logo backed up as logo-backup.png"
        fi
        
        # Install new logo
        cp new-logo.png public/logo.png
        echo "✅ Logo updated successfully!"
        
        # Optimize logo if imagemagick is available
        if command -v convert &> /dev/null; then
            echo "🎨 Optimizing logo..."
            convert public/logo.png -resize 256x256 -quality 90 public/logo.png
            echo "✅ Logo optimized for web"
        fi
        
        # Clean up
        rm new-logo.png
        echo "🧹 Cleaned up new-logo.png"
        
        echo ""
        echo "🎉 All done! Your new logo is now active."
        echo "🔄 Please restart your development server to see changes:"
        echo "   npm run dev"
        
    else
        echo "❌ Error: new-logo.png not found in current directory"
        echo ""
        download_instructions
    fi
}

create_backup() {
    if [ -f "public/logo.png" ]; then
        cp public/logo.png public/logo-backup.png
        echo "✅ Backup created: public/logo-backup.png"
    else
        echo "❌ No current logo to backup"
    fi
}

restore_backup() {
    if [ -f "public/logo-backup.png" ]; then
        cp public/logo-backup.png public/logo.png
        echo "✅ Logo restored from backup"
        echo "🔄 Please restart your development server"
    else
        echo "❌ No backup found to restore from"
    fi
}

case "$1" in
    "install")
        install_logo
        ;;
    "download")
        download_instructions
        ;;
    "status")
        show_status
        ;;
    "backup")
        create_backup
        ;;
    "restore")
        restore_backup
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        echo "To get started:"
        download_instructions
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        ;;
esac
