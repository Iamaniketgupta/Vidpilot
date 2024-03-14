import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"

import Jwt  from "jsonwebtoken";
const verifyJwt = asyncHandler(async(req,_,next)=>{
   const token= req.cookies?.authId || req.header("Authorization")?.split("Bearer ")[1]
    if(!token){
        throw new ApiError(401,"token unauthorized request")
    }
    const decodedData= Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    if(!decodedData) throw new ApiError(401,"decodedData unauthorized request");

   const user= await User.findById(decodedData?._id).select("-password -refreshToken");
    if(!user) throw ApiError(401,"invalid access token");

    req.user =user;

    next();

})



export {verifyJwt};