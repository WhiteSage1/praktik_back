const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');

router.route('/')
    .get(adminController.getAllUsers)
    // .post(adminController.createNewUser)
    // .patch(adminController.updateUser)
    // .delete(adminController.deleteUser)

router.route('/:id')
    .get(adminController.getUserById)

router.route('/:id/suspend')
    .patch(adminController.suspendUser)

router.route('/:id/ban')
    .patch(adminController.banUser)

router.route('/:id/unban')
    .patch(adminController.unbanUser)

module.exports = router;