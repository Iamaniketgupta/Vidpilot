import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({

    fullName: {
        type: String,
        required: true,
        trim: true,
    },

    username: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        required: true,
        max: 15
    },

    avatar: {
        type: String,
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,

    },
    password: {
        type: String,
        required: true,
        trim: true,
    },


    coverImg: {
        type: String,
    },

    refreshToken: {
        type: String,
    },

    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "videos"
    }
    ]


}, { timestamps: true });

// Hashing
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = bcrypt.hash(this.password, 10);
    next();
})

//methods is an object where isPasswordCorrect is inserted as new method
userSchema.methods.isPasswordCorrect = async function (password) {  //user password
    return await bcrypt.compare(password, this.password)
}

// JWT ACCESS TOKEN
userSchema.methods.generateAccessToken = async function (password) {  //user password
    return jwt.sign(
        // payload
        {   
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName

        }, process.env.ACCESS_TOKEN_SECRET,

        // expiry
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        });
}

// JWT REFRESH TOKEN
userSchema.methods.generateRefreshToken = async function (password) {  //user password
    return jwt.sign(
        // payload
        {   
            _id:this._id,

        }, process.env.REFRESH_TOKEN_SECRET,
        // expiry
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        });

}

export const user = mongoose.model('User', userSchema);