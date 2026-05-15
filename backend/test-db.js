require('dotenv').config();
const mongoose = require('mongoose');

async function testConn() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('SUCCESS: Database connected');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Database connection failed');
        console.error(err);
        process.exit(1);
    }
}

testConn();
