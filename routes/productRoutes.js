const {
	createProduct,
	getProduct,
	getAllProducts,
	updateProduct,
	updateProductImage,
	getProductsCount,
	deleteProduct,
} = require('../controllers/productController')
const { verifyAdminOrEmployee } = require('../middlewares/verifyRole')
const photoUpload = require('../middlewares/photoUpload')
const verifyObjectId = require('../middlewares/verifyObjectId')

const router = require('express').Router()

// /api/products
router
	.route('/')
	.post(verifyAdminOrEmployee, photoUpload.single('image'), createProduct)
	.get(getAllProducts)

// /api/products/count
router.get('/count', getProductsCount)

// /api/products/:id
router
	.route('/:id')
	.get(verifyObjectId, getProduct)
	.put(verifyObjectId, verifyAdminOrEmployee, updateProduct)
	.delete(verifyObjectId, verifyAdminOrEmployee, deleteProduct)

// /api/products/update-image/:id
router.put(
	'/update-image/:id',
	verifyObjectId,
	verifyAdminOrEmployee,
	photoUpload.single('image'),
	updateProductImage,
)

module.exports = router
