const User = require('../models/User');
const Post = require('../models/Post');
const asyncHandler = require('express-async-handler');

// @desc Get all posts
// @route GET /posts
// @access Private
const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find().lean()
    if (!posts?.length) {
        return res.status(400).json({ message: 'No posts found' })
    }
    res.json(posts)
})

// @desc Create new post
// @route POST /posts
// @access Private
const createNewPost = asyncHandler(async (req, res) => {
    const { sellerId, title, description, price, currency, category, condition, images, location, tags, contactPhone } = req.body

    // Confirm data
    if (!sellerId || !title || !description || price === undefined) {
        return res.status(400).json({ message: 'All fields are required (sellerId, title, description, price)' })
    }

    const seller = await User.findById(sellerId).exec()
    if (!seller) {
        return res.status(400).json({ message: 'Seller (user ID) not found' })
    }

    if (category && !["Electronics", "Cars", "Clothing", "Furniture", "Real Estate", "Books", "Sports", "Toys", "Other"].includes(category)) {
        return res.status(400).json({ message: 'Invalid category' })
    }

    if (condition && !["New", "Used", "Refurbished"].includes(condition)) {
        return res.status(400).json({ message: 'Invalid condition' })
    }

    if (images && !Array.isArray(images)) {
        return res.status(400).json({ message: 'Images must be an array of URLs' })
    }

    if (location) {
        if (!location.country || !location.city) {
            return res.status(400).json({ message: 'Location must include country and city' })
        }
    }

    if (tags && !Array.isArray(tags)) {
        return res.status(400).json({ message: 'Tags must be an array of strings' })
    }

    if (contactPhone && typeof contactPhone !== 'string') {
        return res.status(400).json({ message: 'Contact phone must be a string' })
    }

    const postObject = {
        title,
        description,
        price,
        currency: typeof currency === 'string' && currency.trim() ? currency.trim().toUpperCase() : 'EUR',
        seller,
        category,
        condition,
        images,
        location,
        tags,
        contactPhone,
    }

    // Create and store new post
    const post = await Post.create(postObject)
    if (post) { // Created
        res.status(201).json({ message: `New post ${title} created` })
    } else {
        res.status(400).json({ message: 'Invalid post data received' })
    }
})

// @desc Update a post
// @route PATCH /posts
// @access Private
const updatePost = asyncHandler(async (req, res) => {
    // Implementation for updating a post goes here
    const { id, title, description, price, currency, category, condition, images, location, tags, contactPhone, negotiable } = req.body
    // comments,

    const post = await Post.findById(id).exec()
    if (!post) {
        return res.status(400).json({ message: 'Post not found' })
    }

    // // Ensure the request is authenticated and `req.user` is available
    // if (!req.user || !req.user.id) {
    //     return res.status(401).json({ message: 'Unauthorized' })
    // }

    // if (post.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    //     return res.status(403).json({
    //         message: 'Not authorized to update this post'
    //     })
    // }

    // Update the post fields
    if (title !== undefined) {
        post.title = title
    }
    if (description !== undefined) {
        post.description = description
    }
    if (price !== undefined) {
        post.price = price
    }

    if (currency !== undefined) {
        post.currency = currency
    }

    if (category !== undefined) {
        if (!["Electronics", "Cars", "Clothing", "Furniture", "Real Estate", "Books", "Sports", "Toys", "Other"].includes(category)) {
            return res.status(400).json({ message: 'Invalid category' })
        }
        post.category = category
    }

    if (condition !== undefined) {
        if (!["New", "Used", "Refurbished"].includes(condition)) {
            return res.status(400).json({ message: 'Invalid condition' })
        }
        post.condition = condition
    }

    if (images !== undefined) {
        if (!Array.isArray(images)) {
            return res.status(400).json({ message: 'Images must be an array of URLs' })
        }
        post.images = images
    }

    // if (comments !== undefined) {
    //     if (!Array.isArray(comments)) {
    //         return res.status(400).json({ message: 'Comments must be an array of comment IDs' })
    //     }
    //     post.comments = comments
    // }

    if (location !== undefined ) { // Update location if provided
        if (!location.country || !location.city) {
            return res.status(400).json({ message: 'Both country and city are required for location' })
        }
        post.location.country = location.country
        post.location.city = location.city
    }

    if (tags !== undefined) {
        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: 'Tags must be an array of strings' })
        }
        post.tags = tags
    }

    if (contactPhone !== undefined) { 
        post.contactPhone = contactPhone
    }

    if (negotiable !== undefined) {
        post.negotiable = negotiable
    }

    const updatedPost = await post.save()
    res.json({ message: `Post ${updatedPost.title} updated` })
})

// @desc Delete a post
// @route DELETE /posts
// @access Private
const deletePost = asyncHandler(async (req, res) => {
    // Implementation for deleting a post goes here
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Post ID is required' })
    }

    const post = await Post.findById(id).exec()
    if (!post) {
        return res.status(400).json({ message: 'Post not found' })
    }

    // // Ensure the request is authenticated and `req.user` is available
    // if (!req.user || !req.user.id) {
    //     return res.status(401).json({ message: 'Unauthorized' })
    // }

    // if (post.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    //     return res.status(403).json({
    //         message: 'Not authorized to delete this post'
    //     })
    // }

    const result = await post.deleteOne()
    res.json({ message: `Post ${post.title} deleted` })
})



module.exports = {
    getAllPosts,
    createNewPost,
    updatePost,
    deletePost
}
