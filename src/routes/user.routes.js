import { Router } from "express";
import { logOutUser, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(upload.fields(
    [
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]
), registerUser);


userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJwt,logOutUser);
userRouter.route("/refreshToken").post(refreshAccessToken);

export { userRouter };