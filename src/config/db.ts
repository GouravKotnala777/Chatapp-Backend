import mongoose from "mongoose";

async function connectDatabase(){
    try {
        const databaseURI = process.env.DATABASE_URI;
        if (!databaseURI) throw Error("databaseURI is undefined");
        await mongoose.connect(databaseURI);
        console.log("Database....");
    } catch (error) {
        console.log(error);
        console.log("db mai koi error hai");
    }
};

export default connectDatabase;
