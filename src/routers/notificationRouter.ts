import express from "express"
import { isUserAuthenticated } from "../middlewares/auth";
import { createNotification, myNotifications, removeNotification, updateNotificationStatus, watchNotification } from "../controllers/notificationController";

const notificationRouter = express.Router();

notificationRouter.route("/all").get(isUserAuthenticated, myNotifications);
notificationRouter.route("/create").post(isUserAuthenticated, createNotification);
notificationRouter.route("/watch").put(isUserAuthenticated, watchNotification);
notificationRouter.route("/remove").delete(isUserAuthenticated, removeNotification);
notificationRouter.route("/update").put(isUserAuthenticated, updateNotificationStatus);

export default notificationRouter;