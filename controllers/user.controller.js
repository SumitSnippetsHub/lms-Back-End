import { token } from "morgan";
import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    httpOnly: true,
    secure: true
};

const register = async (req, res, next) => {

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return next(new AppError('All fields are required', 400));

    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('Email already exists', 400));
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url:
                'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
        }
    });

    if (!user) {
        return next(new AppError('user registration failed,please try again', 400));

    }

    //TODO file upload // done
    console.log('file details', JSON.stringify(req.file));
    if (req.file) {

        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                //Remove file from local server
                fs.rm(`uploads/${req.file.filename}`);
            }
        } catch (err) {
            return next(new AppError(err || 'File not uploaded,please try again', 500));
        }
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();
    res.cookie('token', token, cookieOptions)
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    });

};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        //check is there or not
        if (!email || !password) {
            return next(new AppError('All fields are required', 400));

        }

        const user = await User.findOne({
            email,
        }).select('+password');


        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError("Email or password does not match", 400));
        } //always use await for bcrypt type functions

        // console.log(user);

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
            token
        });
    } catch (err) {
        return next(new AppError(err.message, 500));
    };



};

const logout = (req, res) => {
    // console.log(token);
    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "user logged out successfully",
    });
};

const getProfile = async (req, res, next) => {
    // res.send('here is me');
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        res.status(200).json({
            success: true,
            message: 'User detils',
            user
        });
    } catch (err) {
        return next(new AppError("Failed to fetch user details"));
    };


};

const forgotPassword = async (req, res, next) => {
    const { email } = req.body; //fetch email form body


    //check validations if exists or not
    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    //check in DB exists or not
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("Email not registered"))
    }

    //if exists then set token for resetpassword
    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPassURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log(resetPassURL);
    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPassURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab${resetPassURL}.\n If you have not registered this, kindly ignore.`;
    // method to send email
    try {
        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`
        })
    } catch (err) {
        // if not works then this for safety purpose
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();
        return next(new AppError(err.message, 500));
    }
}

const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;

    const { password } = req.body;

    // console.log("reset" , resetToken);

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log(forgotPasswordToken);

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Token is invalid or expired, please try again', 400))
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully'
    })
}

const changePassword = async (req, res, next) => {
    //fetch old and new passwords
    const { oldPassword, newPassword } = req.body;

    //take out id for reference
    const { id } = req.user;

    //check validations
    if (!oldPassword || !newPassword) {
        return next(new AppError('All fiels are required', 400))
    }

    //by id fetch out user detail + explicitly password
    const user = await User.findById(id).select('+password');
    console.log(user);

    //check validations
    if (!user) {
        return next(new AppError('user does not exist', 400))
    }

    //compare the old password with correct one
    const isPasswordValid = await user.comparePassword(oldPassword);

    //check if not
    if (!isPasswordValid) {
        return next(new AppError('Invalid old password', 400))
    }

    //all good --update
    user.password = newPassword;

    //save
    await user.save();

    //remove from the objects for safety
    user.password = undefined;

    //response send
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    })
}

const updateUser = async (req, res, next) => {
    const { fullName } = req.body;

    const { id } = req.user;

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError('User does not exist', 400))
    }

    if (fullName) {
        user.fullName = fullName;
    }

    console.log(fullName);

    if (req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                //Remove file from local server
                fs.rm(`uploads/${req.file.filename}`);
            }
        } catch (err) {
            return next(new AppError(err || 'File not uploaded,please try again', 500));
        }
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user
    });

}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}