const mongoose = require('mongoose');
const DataRow = require('./database/models/DataRow');

async function test() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rsml_validator');
    console.log('Connected to MongoDB');

    // Find one row
    const row = await DataRow.findOne({}).lean();
    if (!row) { console.log('No rows found'); process.exit(0); }

    console.log('Row _id:', row._id);
    console.log('data type:', typeof row.data, row.data instanceof Map ? 'IS Map' : 'NOT Map');
    const dataKeys = Object.keys(row.data || {});
    console.log('data keys (first 5):', dataKeys.slice(0, 5));

    // Pick a field to test with
    // Use last key so it's unlikely to be audio
    const field = dataKeys[dataKeys.length - 1];
    const originalVal = row.data[field];
    const testVal = '__TEST_' + Date.now();
    console.log('\nUpdating field:', field);
    console.log('Original value (first 60 chars):', String(originalVal).slice(0, 60));
    console.log('Test value:', testVal);

    const result = await DataRow.updateOne(
        { _id: row._id },
        { $set: { [`data.${field}`]: testVal } }
    );
    console.log('\nupdateOne result:', JSON.stringify(result));

    // Read back
    const updated = await DataRow.findOne({ _id: row._id }).lean();
    const readBack = updated.data[field];
    console.log('Read back value:', String(readBack).slice(0, 80));
    console.log('MATCH?', readBack === testVal ? '✅ YES - DB write/read works' : '❌ NO - DB write/read BROKEN');

    // Restore original value
    await DataRow.updateOne(
        { _id: row._id },
        { $set: { [`data.${field}`]: originalVal } }
    );
    console.log('Original value restored.');

    process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
