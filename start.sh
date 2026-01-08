#!/bin/bash
export PATH="/home/ubuntu/.bun/bin:$PATH"
export NODE_ENV=production
cd /home/ubuntu/website-yupika/yupika.dilettantegames.com-site
exec ~/.bun/bin/bun server.js
