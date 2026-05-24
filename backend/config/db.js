const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Prevent creating multiple connections if one is already active
        if (mongoose.connection.readyState === 1) {
            console.log('Using existing MongoDB connection');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,       // Maintains up to 10 active parallel connections for spikes
            minPoolSize: 3,        // Keeps at least 3 connections wide awake 24/7 (Prevents sleeping!)
            socketTimeoutMS: 45000, // Closes out frozen requests after 45 seconds
            serverSelectionTimeoutMS: 5000, // Time out fast instead of showing infinite spinner
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;