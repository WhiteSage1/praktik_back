const User = require('../models/User');
const Post = require('../models/Post');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }
    res.json(users)
})

// @desc Get one user
// @route GET /users/:id
// @access Private
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: 'User ID required' })
    }

    const user = await User.findById(id).select('-password').lean()

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    // Confirm data
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const userObject = { username, email, "password": hashedPassword }

    // Create and store new user
    const user = await User.create(userObject)

    if (user) { // Created
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

// @desc Update a user
// @route PUT /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, email, password, avatar, bio, phoneNumber, location } = req.body

    // Confirm data
    if (!id || !username || !email) {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).lean().exec()
    // Allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.email = email
    if (password) { // Update password if provided
        // Hash password
        user.password = await bcrypt.hash(password, 10)
    }
    if (avatar) { // Update avatar if provided
        user.avatar = avatar
    }
    if (bio) { // Update bio if provided
        user.bio = bio
    }
    if (phoneNumber) { // Update phone number if provided
        user.phoneNumber = phoneNumber 
    }
    if (location) { // Update location if provided
        if (!location.country || !location.city) {
            return res.status(400).json({ message: 'Both country and city are required for location' })
        }
        user.location.country = location.country
        user.location.city = location.city
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID required' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    res.json({ message: `${user.username} with ID ${user._id} deleted` })
})

module.exports = {
    getAllUsers,
    getUserById,
    createNewUser,
    updateUser,
    deleteUser
}