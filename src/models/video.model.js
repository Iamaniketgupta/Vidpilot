import mongoose, { Schema } from "mongoose";


const videoSchema = new Schema({
    videFile: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished :{
        tyoe : Boolean,
        default :true,
    },

    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }


}, { timestamps: true });



export const Video = mongoose.model("Video", videoSchema)