#!/bin/bash
export PATH="/home/alma/.nvm/versions/node/v18.17.1/bin:$PATH"
export NODE_ENV=production
cd /home/alma/homepage
exec node server.js
