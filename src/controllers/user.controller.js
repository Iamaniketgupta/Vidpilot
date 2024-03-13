import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudianry } from "../utils/cloudinary.js"
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
    // Update user document with refresh token
    const refreshToken = await userRegister.generateRefreshToken();
    const rtoken = await User.findByIdAndUpdate(userRegister._id, { refreshToken: refreshToken });

    if (!rtoken)
        throw new ApiError(500, "something went wrong");

    res.status(200).json({
        message: "Registered Successfully"
    });

})

const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "Registered Successfully"
    })
})

export { registerUser, loginUser }