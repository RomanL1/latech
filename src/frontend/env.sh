#!/bin/sh
cat <<EOF > /usr/share/nginx/html/config.js
window.ENV = Object.freeze({
  VITE_API_HOST: "${VITE_API_HOST}",
  VITE_WS_HOST: "${WEBSOCKET_SERVER_URL}"
});
EOF