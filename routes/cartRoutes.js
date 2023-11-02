const { addItemToCart, removeItemFromCart, getCartForUser, IncOrDecQuantityForProduct } = require("../controllers/cartController")
const verifyObjectId = require("../middlewares/verifyObjectId")
const { verifyToken } = require("../middlewares/verifyRole")

const router = require('express').Router()

// /api/carts/add
router.put('/add', verifyToken, addItemToCart)

// /api/carts/remove
router.put('/remove', verifyToken, removeItemFromCart)

// /api/carts/user/:id
router.get('/user/:id', verifyObjectId, verifyToken, getCartForUser)

// /api/carts/inc-dec-quantity
router.put('/inc-dec-quantity', verifyToken, IncOrDecQuantityForProduct)
module.exports = router