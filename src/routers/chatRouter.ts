import express from "express";
import { addRemoveAdmin, createChat, deleteChat, myChats, removeMembers, singleChatMessages, updateChat } from "../controllers/chatController";
import { isUserAuthenticated } from "../middlewares/auth";

const chatRouter = express.Router();

chatRouter.route("/new").post(isUserAuthenticated, createChat);
chatRouter.route("/my_chats").get(isUserAuthenticated, myChats);
chatRouter.route("/add-remove-admin").put(isUserAuthenticated, addRemoveAdmin);
chatRouter.route("/remove_members").put(isUserAuthenticated, removeMembers);
chatRouter.route("/selected_chat").post(isUserAuthenticated, singleChatMessages)
                            .put(isUserAuthenticated, updateChat)
                            .delete(isUserAuthenticated, deleteChat);

export default chatRouter;