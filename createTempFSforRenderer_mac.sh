#!/bin/bash
set -euo pipefail

IMG_FILE=/tmp/compileRAMTempFS.dmg
MOUNT_POINT=/tmp/compileRAMTempFS
SIZE=500m

# Create the image if it doesn't exist
if [ ! -f "$IMG_FILE" ]; then
    # Create a read/write disk image
    hdiutil create -size "$SIZE" -fs "HFS+" -volname "LatechRendererTemp" "$IMG_FILE"
    echo "Created $IMG_FILE"
else
    echo "Reusing existing image $IMG_FILE"
fi

# Mount if not already mounted
mkdir -p "$MOUNT_POINT"

if ! mount | grep -q "on $MOUNT_POINT ("; then
    hdiutil attach "$IMG_FILE" -mountpoint "$MOUNT_POINT"
    chmod 777 "$MOUNT_POINT"
    echo "Mounted $IMG_FILE to $MOUNT_POINT"
else
    echo "$MOUNT_POINT already mounted, skipping"
fi
