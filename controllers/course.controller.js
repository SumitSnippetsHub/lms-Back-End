import Course from "../models/course.model.js"
import AppError from "../utils/error.utils.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({}).select('-lectures');

        res.status(200).json({
            success: true,
            message: "All course",
            courses
        })

    } catch (err) {
        return next(new AppError(err.message, 500));
    }

    // res.send("Course Router Working");
}

const getLecturesByCourseId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError("Invalid course id", 400));
        }


        res.status(200).json({
            success: true,
            message: "Course lectures fetched successfully",
            lectures: course.lectures
        });
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}

const createCourse = async (req, res, next) => {
    const { title, description, category, createdBy } = req.body

    if (!title || !description || !category || !createdBy) {
        return next(new AppError('All field are required', 400))
    }

    //create course 
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: "your_id",
            secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
        }
    });

    //checks
    if (!course) {
        return next(new AppError('Course could not created, please try again', 400))
    }

    // Run only if user sends a file
    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms', // Save files in a folder named lms
            });

            // If success
            if (result) {
                // Set the public_id and secure_url in array
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }

            // After successful upload remove the file from local storage
            fs.rm(`uploads/${req.file.filename}`);
        } catch (error) {
            // Empty the uploads directory without deleting the uploads directory
            for (const file of await fs.readdir('uploads/')) {
                await fs.unlink(path.join('uploads/', file));
            }

            // Send the error message
            return next(
                new AppError(
                    JSON.stringify(error) || 'File not uploaded, please try again',
                    400
                )
            );
        }
    }

    await course.save();

    res.status(200).json({
        success: true,
        message: "Course created successfully",
        course
    });
}

const updateCourse = async (req, res, next) => {

}

const removeCourse = async (req, res, next) => {

}



export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse
}