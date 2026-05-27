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

// @desc get user by id
// @route GET /users/:id
// @access Private
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params || req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' })
    }

    const user = await User.findById(id).select('-password').lean()

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
})

// @desc Suspend a user
// @route PATCH /users/:id/suspend
// @access Private
const suspendUser = asyncHandler(async (req, res) => {
    // Implementation for suspending a user
    const { id } = req.params
    const { suspensionExpiresAt } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' })
    }

    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    user.status = 'suspended'
    if (suspensionExpiresAt == '1d') {
        user.suspensionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    } else if (suspensionExpiresAt == '7d') {
        user.suspensionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    } else if (suspensionExpiresAt == '30d') {
        user.suspensionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }

    await user.save()

    res.json({ message: `User ${user.username} suspended until ${user.suspensionExpiresAt}` })
})

const banUser = asyncHandler(async (req, res) => {
    // Implementation for banning a user
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' })
    }

    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    user.status = 'banned'
    user.suspensionExpiresAt = null // Clear any existing suspension
    await user.save()

    res.json({ message: `User ${user.username} banned` })
})

const unbanUser = asyncHandler(async (req, res) => {
    // Implementation for unbanning a user
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' })
    }

    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    user.status = 'active'
    user.suspensionExpiresAt = null // Clear any existing suspension
    await user.save()

    res.json({ message: `User ${user.username} unbanned` })
})


// deleteUser()
// deleteAnyPost()
// getDashboardStats()
// getReportedPosts()

module.exports = {
    getAllUsers,
    getUserById,
    suspendUser,
    banUser,
    unbanUser
}