const { registerController, loginController } = require("../controllers/authController")
const router = require('express').Router()

// /api/auth/register
router.post('/register', registerController)
// /api/auth/login
router.post('/login', loginController)

module.exports = router