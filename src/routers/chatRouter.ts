import express from "express";
import { addRemoveAdmin, createChat, deleteChat, myChats, singleChatMessages, updateChat } from "../controllers/chatController";
import { isUserAuthenticated } from "../middlewares/auth";

const chatRouter = express.Router();

chatRouter.route("/new").post(isUserAuthenticated, createChat);
chatRouter.route("/my_chats").get(isUserAuthenticated, myChats);
chatRouter.route("/add-remove-admin").put(isUserAuthenticated, addRemoveAdmin);
chatRouter.route("/:chatID").get(isUserAuthenticated, singleChatMessages)
                            .put(isUserAuthenticated, updateChat)
                            .delete(isUserAuthenticated, deleteChat);

export default chatRouter;