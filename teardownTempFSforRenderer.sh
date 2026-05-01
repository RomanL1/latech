#!/bin/bash
set -euo pipefail

MOUNT_POINT=/mnt/compileRAMTempFS
SHM_FILE=/dev/shm/compileRAMTempFS.img

if mountpoint -q "$MOUNT_POINT"; then
    umount "$MOUNT_POINT"
    echo "Unmounted $MOUNT_POINT"
fi

LOOP=$(losetup -j "$SHM_FILE" | cut -d: -f1)
if [ -n "$LOOP" ]; then
    losetup -d "$LOOP"
    echo "Detached $LOOP"
fi

rm -f "$SHM_FILE"
echo "Removed $SHM_FILE"