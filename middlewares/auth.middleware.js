import Jwt from "jsonwebtoken";
import AppError from "../utils/error.utils.js";

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new AppError('Unauthenticate, please login again', 400));
    };

    const userDetails = Jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;

    next();

}

const authorizedRoles = (...roles) => async (req, res, next) => {
    const currUserRole = req.user.role;
    if (!roles.includes(currUserRole)) {
        return next(new AppError('You do not have permission to access this page', 403))
    }
    next();
}

export {
    isLoggedIn,
    authorizedRoles
}