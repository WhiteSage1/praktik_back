const express = require('express');
const router = express.Router();
const postController = require('../controllers/postsController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/public', postController.getAllPosts)

router.use(verifyJWT)

router.route('/')
    .get(postController.getAllPosts)
    .post(postController.createNewPost)
    .patch(postController.updatePost)
    .delete(postController.deletePost)

module.exports = router;