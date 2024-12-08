import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: [true]
        },
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        phone: {
            type: String,
            required:[true, "phone is required"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address",
            ],
        },
        profilePictures:{
            type: String,
            required:[true]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: ["manager", "driver"],
            default: "driver",
        },
        clientId:{
            type:String,
            required:[true]
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updateAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

// Hash password before saving the user
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
