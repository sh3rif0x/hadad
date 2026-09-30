#!/bin/bash

declare -A seen_hashes
duplicates_removed=0

# Process all image files
find . -type f \( -iname "*.jpg" -o -iname "*.webp" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.jpge" -o -iname "*.webp4" \) | sort | while read file; do
    # Skip directories
    [[ -d "$file" ]] && continue
    
    # Calculate MD5 hash
    hash=$(md5sum "$file" | awk '{print $1}')
    
    # Store file paths by hash
    if grep -q "^$hash " <<< ""; then
        # Duplicate found
        echo "Removing duplicate: $file"
        rm -f "$file"
        ((duplicates_removed++))
    else
        echo "^$hash $file" >> .hashes_temp
    fi
done

echo "Removed $duplicates_removed duplicate files"
rm -f .hashes_temp
