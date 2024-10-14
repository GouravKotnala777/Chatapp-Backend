import express from "express";
import { createChat, deleteChat, myChats, updateChat } from "../controllers/chatController";

const chatRouter = express.Router();

chatRouter.route("/new").post(createChat);
chatRouter.route("/my_chats").get(myChats);
chatRouter.route("/:chatID").put(updateChat)
                            .delete(deleteChat);

export default chatRouter;