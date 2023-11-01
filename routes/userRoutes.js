const router = require('express').Router()
const {
	getAllUsers,
	getUserProfile,
	updateUserPorfile,
	getUsersCount,
	deleteUserProfile,
	changeUserRole,
} = require('../controllers/userController')
const { verifyAdminOrEmployee, verifyUserHimself, verifyAdmin, verifyToken } = require('../middlewares/verifyRole')
const verifyObjectId = require('../middlewares/verifyObjectId')

// /api/users/profile
router.get('/profile', verifyAdminOrEmployee, getAllUsers)

// /api/users/count
router.get('/count', verifyAdminOrEmployee, getUsersCount)

// /api/users/profile/:id
router
	.route('/profile/:id')
	.get(verifyObjectId, getUserProfile)
	.put(verifyObjectId, verifyUserHimself, updateUserPorfile)
	.delete(verifyObjectId, verifyToken, deleteUserProfile)

// /api/users/update-role/:id
router.route('/update-role/:id')
	.put(verifyObjectId, verifyAdmin, changeUserRole)

module.exports = router
