import mongoose from "mongoose";

type connectionState = {
    isConnected?: number;
};

const connection: connectionState = {};

async function dbConnect() {
    if (connection.isConnected) {
        console.log("🟡 Database already connected");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI || "");
        connection.isConnected = db.connections[0].readyState;

        console.log(`🟢 Database Successfully Conncted: ${db.connection.host}`);
    } catch (error) {
        console.log(`🔴 Error Connecting Database: ${error}`);

        process.exit(1);
    }
}

export default dbConnect;