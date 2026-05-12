#!/bin/bash
set -euo pipefail

MOUNT_POINT=/tmp/compileRAMTempFS
IMG_FILE=/tmp/compileRAMTempFS.dmg

if mount | grep -q "on $MOUNT_POINT ("; then
    hdiutil detach "$MOUNT_POINT"
    echo "Unmounted $MOUNT_POINT"
fi

if [ -f "$IMG_FILE" ]; then
    rm -f "$IMG_FILE"
    echo "Removed $IMG_FILE"
fi
