import express from "express";
import { createMessage, deleteMessagesForAll, deleteMessagesForMe } from "../controllers/messageController";
import { isUserAuthenticated } from "../middlewares/auth";

const messageRouter = express.Router();

messageRouter.route("/new").post(isUserAuthenticated, createMessage);
messageRouter.route("/delete-for-all").delete(isUserAuthenticated, deleteMessagesForAll);
messageRouter.route("/delete-for-me").delete(isUserAuthenticated, deleteMessagesForMe);


export default messageRouter;