#!/bin/sh
# entrypoint.sh — runs seed.js ONCE on first deployment, then starts the server.
# "First deployment" is detected by checking whether an admin user exists in MongoDB.
# If the DB is not yet reachable, we retry up to 30 times (1s apart).

set -e

echo "⏳ Waiting for MongoDB to be ready..."

MAX_RETRIES=30
COUNT=0

until node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => { console.log('DB OK'); process.exit(0); })
    .catch(() => process.exit(1));
" 2>/dev/null; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ MongoDB not reachable after ${MAX_RETRIES} retries. Aborting."
    exit 1
  fi
  echo "   Retry $COUNT/$MAX_RETRIES..."
  sleep 1
done

echo "✅ MongoDB is ready."

# Check whether an admin user already exists. If not, seed.
ADMIN_EXISTS=$(node -e "
  const mongoose = require('mongoose');
  const User = require('./database/models/User');
  mongoose.connect(process.env.MONGO_URI).then(async () => {
    const count = await User.countDocuments({ role: 'admin' });
    console.log(count > 0 ? 'yes' : 'no');
    process.exit(0);
  }).catch(() => { console.log('no'); process.exit(0); });
" 2>/dev/null)

if [ "$ADMIN_EXISTS" = "no" ]; then
  echo "🌱 No admin user found — running seed.js..."
  node seed.js
  echo "✅ Seeding complete."
else
  echo "ℹ️  Admin user already exists — skipping seed."
fi

echo "🚀 Starting backend server..."
exec node index.js
