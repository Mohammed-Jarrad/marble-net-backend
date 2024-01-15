const {
	createClient,
	getClients,
	updateClient,
	deleteClient,
	getSingle,
} = require('../controllers/clientController');
const photoUpload = require('../middlewares/photoUpload');
const { verifyAdminOrEmployee } = require('../middlewares/verifyRole');

const router = require('express').Router();

router.post('/', verifyAdminOrEmployee, photoUpload.single('image'), createClient);
router.get('/', getClients);
router.put('/:id', verifyAdminOrEmployee, photoUpload.single('image'), updateClient);
router.delete('/:id', verifyAdminOrEmployee, deleteClient);
router.get('/:id', getSingle);

module.exports = router;
