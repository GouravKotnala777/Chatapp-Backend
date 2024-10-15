import express from "express";
import { createMessage, deleteMessagesForAll, deleteMessagesForMe } from "../controllers/messageController";

const messageRouter = express.Router();

messageRouter.route("/new").post(createMessage);
messageRouter.route("/delete-for-all").delete(deleteMessagesForAll);
messageRouter.route("/delete-for-me").delete(deleteMessagesForMe);


export default messageRouter;