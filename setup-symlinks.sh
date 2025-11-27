#!/bin/bash
# Create symlinks needed for vite.config.ts path resolution
# These symlinks are required because vite.config.ts cannot be edited
# and has incorrect path references that point to parent directory

ln -sf /home/runner/workspace/client/shared /home/runner/shared 2>/dev/null
ln -sf /home/runner/workspace/server /home/runner/server 2>/dev/null
ln -sf /home/runner/workspace/attached_assets /home/runner/attached_assets 2>/dev/null

echo "Symlinks created for vite path resolution"
