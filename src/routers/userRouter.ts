import express from "express";
import { login, myFriends, myProfile, register, replyFriendRequest, searchUser, sendFriendRequest, setProfilePicture } from "../controllers/userController";
import { upload } from "../middlewares/multer";
import { isUserAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();

userRouter.route("/new").post(register);
userRouter.route("/login").post(login);
userRouter.route("/set-image").post(isUserAuthenticated, upload.single("profile_image"), setProfilePicture);
userRouter.route("/me").get(isUserAuthenticated, myProfile);
userRouter.route("/friends").get(isUserAuthenticated, myFriends);
userRouter.route("/search").post(isUserAuthenticated, searchUser);
userRouter.route("/friends_request").post(isUserAuthenticated, sendFriendRequest)
                                    .put(isUserAuthenticated, replyFriendRequest);


export default userRouter;