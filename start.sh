#!/bin/bash
export PATH="/home/alma/.bun/bin:$PATH"
export NODE_ENV=production
cd /home/alma/homepage
exec ~/.bun/bin/bun server.js
