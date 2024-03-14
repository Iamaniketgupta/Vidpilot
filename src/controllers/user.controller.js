import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudianry } from "../utils/cloudinary.js"
import Jwt from "jsonwebtoken";
const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;
    //validation of the required values
    if (
        [fullName, email, username, password].some((item) => item?.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are required");
    }

    //validation of the existing user
    const isUserExist = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserExist) {
        throw new ApiError(409, 'User Already Exist')
    }

    //using multer includes files to access
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path

    // console.log(avatarLocalPath)
    // console.log(coverLocalPath)

    const avatar = await uploadOnCloudianry(avatarLocalPath);
    const cover = await uploadOnCloudianry(coverLocalPath);

    // console.log(avatar)
    // console.log(cover)


    const userRegister = await User.create({
        fullName: fullName,
        avatar: avatar?.url || "",
        coverImg: cover?.url || "",
        email: email,
        username: username,
        password: password
    });

    if (!userRegister) {
        res.status(500).json({
            message: "Something Went wrong Try again!"
        });
    }

    res.status(200).json({
        message: "Registered Successfully"
    });

});

const options = {
    httpOnly: true,
    secure: true
}

// const generateAccessandRefreshToken = async(userId)=>{
//     const accessToken = await ValidUser.generateAccessToken();
//     // Update user document with refresh token
//     const refreshToken = await ValidUser.generateRefreshToken();
//     const rtoken = await User.findByIdAndUpdate(ValidUser._id, { refreshToken: refreshToken });
//     if (!rtoken)
//         throw new ApiError(500, "something went wrong");

//     return res.status(200).cookie("authId", accessToken, options)
//         .cookie("referId", rtoken.refreshToken).json({
//             message: "Logged in Success"
//         });

// }

const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;
    //validation of the required values
    if (username && email) throw new ApiError(400, "email or username is required");

    const ValidUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!ValidUser) throw new ApiError(404, "User Does not exist");
    if (!password) throw new ApiError(400, "Password is required");

    if (!await ValidUser.isPasswordCorrect(password)) {
        res.status(401).json({
            message: "Invalid username, email, or password"
        });
    }

    const accessToken = await ValidUser.generateAccessToken();
    // Update user document with refresh token
    const refreshToken = await ValidUser.generateRefreshToken();
    const rtoken = await User.findByIdAndUpdate(ValidUser._id, { refreshToken: refreshToken });
    if (!rtoken)
        throw new ApiError(500, "something went wrong");

    return res.status(200).cookie("authId", accessToken, options)
        .cookie("referId", rtoken.refreshToken, options).json({
            message: "Logged in Success"
        });

});

const logOutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: ''
        }
    });

    return res.status(200).clearCookie("authId", options)
        .clearCookie("referId", options)
        .json({
            message: "Logged Out Success"
        });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refereshToken = req.cookies.referId || req.body.referId
    console.log("from user controller ", refereshToken)

    if (!refereshToken) {
        throw new ApiError(401, "Session Expired");
    }
    const decodedToken = Jwt.verify(refereshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    if (user.refreshToken !== refereshToken) {
        throw new ApiError(401, "Refresh Token is Expired");
    }

    const newAccessToken = await user.generateAccessToken();
    // Update user document with refresh token
    const newRefreshToken = await user.generateRefreshToken();
    const rtoken = await User.findByIdAndUpdate(user?._id, { refreshToken: newRefreshToken });
    if (!rtoken)
        throw new ApiError(500, "something went wrong");

    return res.status(200).cookie("authId", newAccessToken, options)
        .cookie("referId", rtoken.newRefreshToken, options).json({
            message: "Access Token Refreshed"
        });
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) throw new ApiError(400, "Password required");

    const userId = req.user?._id
    const UserInfo = await User.findById(userId);

    if (!UserInfo) throw new ApiError(500, "Could not fetch user");

    const isValidPassword = UserInfo.isPasswordCorrect(oldPassword);

    if (!isValidPassword) throw new ApiError(401, "Invalid Password");

    UserInfo.password = newPassword;
    await UserInfo.save({ validateBeforeSave: false }) //  we are not checking other fields that are validate or not like fullname username etc

    res.status(200).json({
        message: "Password Changed Successfully"
    });

});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(200, req.user, "Current user Fetched Success")
});


const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName: fullName,
            email: email
        }
    }, { new: true }).select("-password")

    if (!user) {
        throw new ApiError(500, "Something went wrong while updating")
    }

    return res.status(200).json({
        data: user,
        message: "Accound Details Updated Successfully"
    });

});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is missing")
    }
    const avatar = await uploadOnCloudianry(avatarLocalPath)
    if (!(avatar.url)) {
        throw new ApiError(500, "Something went wrong")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar?.url,
        }
    }, { new: true }).select("-password")

    if (!user) {
        throw new ApiError(500, "Something went wrong while updating")
    }

    return res.status(200).json({
        data: user,
        message: "Image Updated Successfully"
    });

});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Avatar is missing")
    }
    const coverImage = await uploadOnCloudianry(coverImageLocalPath)
    if (!(coverImage.url)) {
        throw new ApiError(500, "Something went wrong")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage?.url,
        }
    }, { new: true }).select("-password")

    if (!user) {
        throw new ApiError(500, "Something went wrong while updating")
    }

    return res.status(200).json({
        data: user,
        message: "Image Updated Successfully"
    });

});


export {
    registerUser,
    loginUser, logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}