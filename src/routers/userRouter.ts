import express from "express";
import { login, register, setProfilePicture } from "../controllers/userController";
import { upload } from "../middlewares/multer";

const userRouter = express.Router();

userRouter.route("/new").post(register);
userRouter.route("/login").post(login);
userRouter.route("/set-image").post(upload.single("profile_image"), setProfilePicture);


export default userRouter;