#!/bin/bash

# File to create
DIR="../../"
FILE="$DIR/Caddyfile"

# Content to write
# Replace www.capstones.click and capstones.click with your domain names
cat > "$FILE" << 'EOF'
capstones.click {
    redir https://www.capstones.click{uri}
}

www.capstones.click {
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
