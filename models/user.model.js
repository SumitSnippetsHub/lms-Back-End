import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; //to encypt or generate reset token


const userSchema = new Schema({
    fullName: {
        type: 'String',
        required: [true, 'Enter your name'],
        minLength: [5, 'Name must be at least of 5 characters'],
        maxLength: [20, 'Name should be less than 20 characters'],
        trim: true
    },
    email: {
        type: "String",
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email',
        ]
    },
    password: {
        type: 'String',
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    avatar: {
        public_id: {
            type: 'String',
        },
        secure_url: {
            type: 'String'
        }
    },
    role: {
        type: 'String',
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },

    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
    generateJWTToken: async function () {
        return await jwt.sign(
            { id: this._id, email: this.email, role: this.role, subscription: this.subscription },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY,
            }
        )
    },
    comparePassword: async function (plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password);
    },
    //method implementation to create random token for reset
    generatePasswordResetToken: async function () {
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')
            ;
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; //15 min from now

        return resetToken;
    }
}

const User = model('User', userSchema);

export default User;