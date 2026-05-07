#!/bin/bash
set -euo pipefail

SHM_FILE=/dev/shm/compileRAMTempFS.img
MOUNT_POINT=/mnt/compileRAMTempFS #this needs to be the same as deploy.prod.yml's mounted volume for renderer and in renderer's docker run call.
SIZE=500M  # adjust as needed

# Create the backing file if it doesn't exist
if [ ! -f "$SHM_FILE" ]; then
    truncate -s "$SIZE" "$SHM_FILE"
    LOOP=$(losetup --find --show "$SHM_FILE")
    mkfs.ext4 -q "$LOOP"
    echo "Formatted $LOOP"
else
    LOOP=$(losetup --find --show "$SHM_FILE")
    echo "Reusing existing image on $LOOP"
fi

# Mount if not already mounted
mkdir -p "$MOUNT_POINT"
if ! mountpoint -q "$MOUNT_POINT"; then
    mount "$LOOP" "$MOUNT_POINT"
    chmod 777 "$MOUNT_POINT"
    echo "Mounted $LOOP to $MOUNT_POINT"
else
    echo "$MOUNT_POINT already mounted, skipping"
fi