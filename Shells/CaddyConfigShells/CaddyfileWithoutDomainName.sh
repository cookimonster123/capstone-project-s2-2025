#!/bin/bash

# File to create
DIR="../../"
FILE="$DIR/Caddyfile"

# Content to write
cat > "$FILE" << 'EOF'
:80 {
  encode gzip

  @api path /api*
  handle @api {
    reverse_proxy server:3000
  }

  handle {
    reverse_proxy client:5173
  }
}
EOF

echo "File '$FILE' has been created with the provided content."
