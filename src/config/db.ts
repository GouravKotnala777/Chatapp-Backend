import mongoose from "mongoose";

const connectDatabase = () => {
    mongoose.connect(process.env.DATABASE_URI as string, {
        dbName:"ChatApp1"
    }).then(() => {
        console.log("Database....");
    }).catch((error) => {
        console.log(error);
    });
};

export default connectDatabase;