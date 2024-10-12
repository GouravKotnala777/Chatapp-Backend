import express from "express";
import connectDatabase from "./config/db";

const app = express();
const PORT = 8000;

connectDatabase();



app.listen(PORT, () => {
    console.log("listening....");
});