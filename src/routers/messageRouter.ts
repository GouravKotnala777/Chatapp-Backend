import express from "express";
import { createMessage, deleteMessagesForAll, deleteMessagesForMe, forwardMessage, sendImage } from "../controllers/messageController";
import { isUserAuthenticated } from "../middlewares/auth";
import { upload } from "../middlewares/multer";

const messageRouter = express.Router();

messageRouter.route("/new").post(isUserAuthenticated, createMessage);
messageRouter.route("/send-attachment").post(isUserAuthenticated, upload.single("image"), sendImage);
messageRouter.route("/forward").post(isUserAuthenticated, forwardMessage);
messageRouter.route("/delete-for-all").delete(isUserAuthenticated, deleteMessagesForAll);
messageRouter.route("/delete-for-me").delete(isUserAuthenticated, deleteMessagesForMe);


export default messageRouter;