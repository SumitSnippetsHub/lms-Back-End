import { token } from "morgan";
import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";

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
        // avatar: {
        //     public_id,
        //     secure_url: ""
        // }
    });

    if (!user) {
        return next(new AppError('user registration failed,please try again', 400));

    }

    //TODO file upload

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();
    res.cookie('token', token, cookieOptions)
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    });
    res.send('im here');

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

const getProfile = (req, res) => {
    res.send('here is me');
};

export {
    register,
    login,
    logout,
    getProfile
}