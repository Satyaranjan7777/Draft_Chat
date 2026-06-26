import mongoose from "mongoose";

const userSchema = new mongoose.Schema(

    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true

        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        profilePic: {
            type: String,
            default: ""
        },
        profilePicture: {
            url: {
                type: String,
                default: ""
            },
            publicId: {
                type: String,
                default: ""
            }
        }
    },
    {
        timestamps: true,

    }
);

userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);

export default User;
