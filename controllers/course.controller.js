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
    try {
        const { id } = req.params;
        console.log(id);
        const course = await Course.findByIdAndUpdate(
            id, //course which have to update
            {
                $set: req.body //used to set any info get from body regarding update just update
            },
            {
                runValidators: true // checks validation reagrding data 
            }
        );

        if (!course) {
            return next(new AppError('Course with given id does not exist', 500));
        }

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        });
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}


const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError('Course with given id does not exist', 500));
        }

        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}

const addLectureToCourseById = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const { id } = req.params;

        if (!title || !description) {
            return next(new AppError('All fields are required', 400))
        }

        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError('Course does not exist', 400))
        }

        const lecturesData = {
            title,
            description,
            lectures: {}
        };

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms', // Save files in a folder named lms
                });

                // If success
                if (result) {
                    // Set the public_id and secure_url in array
                    lecturesData.lectures.public_id = result.public_id;
                    lecturesData.lectures.secure_url = result.secure_url;
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

        course.lectures.push(lecturesData);

        course.numberOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: "Lecture successfully added to the course",
            course
        });
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}



export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById
}