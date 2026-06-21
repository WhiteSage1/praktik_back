const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const createAuthPayload = (user) => ({
    accessToken: jwt.sign(
        {
            UserInfo: {
                username: user.username,
                role: user.role
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    ),
    refreshToken: jwt.sign(
        { username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )
})

const setRefreshCookie = (res, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production'

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000
    })
}

// @desc Login user
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    const { username, email, identifier, password } = req.body
    const loginIdentifier = (identifier || username || email || '').trim()

    if (!loginIdentifier || !password) {
        return res.status(400).json({ message: 'Username or email and password are required.' })
    }

    // Find user by username or email
    const foundUser = await User.findOne({
        $or: [
            { username: loginIdentifier },
            { email: loginIdentifier.toLowerCase() }
        ]
    }).exec()

    if (!foundUser || foundUser.status === 'suspended' || foundUser.status === 'banned' || foundUser.status === 'deleted') {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    // Check password
    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const { accessToken, refreshToken } = createAuthPayload(foundUser)

    setRefreshCookie(res, refreshToken)

    res.json({ accessToken, username: foundUser.username })
})

// @desc Register user
// @route POST /auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    const normalizedUsername = username?.trim()
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedUsername || !normalizedEmail || !password) {
        return res.status(400).json({ message: 'Username, email and password are required.' })
    }

    if (normalizedUsername.length < 5 || normalizedUsername.length > 30) {
        return res.status(400).json({ message: 'Username should be between 5 and 30 symbols long.' })
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password should be at least 6 symbols long.' })
    }

    const duplicate = await User.findOne({
        $or: [
            { username: normalizedUsername },
            { email: normalizedEmail }
        ]
    }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Username or email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let user

    try {
        user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword
        })
    } catch (err) {
        if (err?.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid user data received.' })
        }
        throw err
    }

    const { accessToken, refreshToken } = createAuthPayload(user)

    setRefreshCookie(res, refreshToken)

    res.status(201).json({ accessToken, username: user.username })
})

// @desc Refresh access token
// @route GET /auth/refresh
// @access Public - because access token is not required to refresh
const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) {
                return res.status(401).json({ message: 'Unauthorized' })
            }

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "role": foundUser.role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken, username: foundUser.username })
        })
    )
})

// @desc Logout user
// @route POST /auth/logout
// @access Public - to clear the cookie if the access token is expired
const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies
    const isProduction = process.env.NODE_ENV === 'production'

    if (!cookies?.jwt) {
        return res.sendStatus(204) // No content - cookie is already cleared
    }
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax'
    })
    res.json({ message: 'Cookie cleared' })
})

module.exports = {
    login,
    register,
    refresh,
    logout
}