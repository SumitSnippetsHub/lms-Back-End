import User from "../models/user.model";
import AppError from "../utils/error.utils";

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    httpOnly: true,
    secure: true
};

const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return next(new AppError('App fields are required', 400));

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
            public_id,
            secure_url: ""
        }
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
    })

};

const login = async (req, res) => {
    const { email, password } = req.body;

    //check is there or not
    if (!email || !password) {
        return next(new AppError('All fields are required', 400));

    }

    const user = await user.findOne({
        email,
    }).select('+password');


};

const logout = (req, res) => {

};

const getProfile = (req, res) => {

};

export {
    register,
    login,
    logout,
    getProfile
}