const express = require('express');
const router = express.Router();
const postController = require('../controllers/postsController');

router.route('/')
    .get(postController.getAllPosts)
    .post(postController.createNewPost)
    .patch(postController.updatePost)
    .delete(postController.deletePost)

module.exports = router;