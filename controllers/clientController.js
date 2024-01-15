const asyncHandler = require('express-async-handler');
const { Client } = require('../models/client');
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary');

/** ----------------------------------------------------------------
 * @desc create client
 * @route /api/carts
 * @method POST
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.createClient = asyncHandler(async (req, res) => {
	const { name } = req.body;
	const client = await Client.findOne({ name });
	if (client) return res.status(409).json({ message: 'هذا الزبون موجود فعلاً' });
	const image = req.file;
	if (!image) {
		return res.status(400).json({ message: 'الرجاء ارفاق صورة.' });
	}
	const { secure_url, public_id } = await cloudinaryUploadImage(image.buffer, image.mimetype);
	const newClient = await Client.create({ name, image: { url: secure_url, publicId: public_id } });
	return res.status(201).json({ message: 'تم الانشاء بنجاح', client: newClient });
});

/** ----------------------------------------------------------------
 * @desc delete client
 * @route /api/carts/:id
 * @method DELETE
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.deleteClient = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const client = await Client.findById(id);
	if (!client) return res.status(404).json({ message: 'الزبون غير موجود' });
	const { publicId } = client.image;
	await cloudinaryRemoveImage(publicId);
	await client.deleteOne();
	return res.status(200).json({ message: 'تم الحذف', client });
});

/** ----------------------------------------------------------------
 * @desc  update client
 * @route /api/carts/:id
 * @method PUT
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.updateClient = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	const client = await Client.findById(id);
	if (!client) return res.status(404).json({ message: 'الزبون غير موجود' });
	if (name) {
		client.name = name;
	}
	if (req.file) {
		await cloudinaryRemoveImage(client.image.publicId);
		const { secure_url, public_id } = await cloudinaryUploadImage(req.file.buffer, req.file.mimetype);
		client.image = { url: secure_url, publicId: public_id };
	}
	await client.save();
	return res.status(200).json({ message: 'تم التعديل', client });
});

/** ----------------------------------------------------------------
 * @desc  get clients
 * @route /api/carts/
 * @method GET
 * @access ALL
   -----------------------------------------------------------------
 */
module.exports.getClients = asyncHandler(async (req, res) => {
	const clients = await Client.find();
	return res.status(200).json({ clients });
});

/** ----------------------------------------------------------------
 * @desc  get single
 * @route /api/carts/:id
 * @method GET
 * @access ALL
   -----------------------------------------------------------------
 */
module.exports.getSingle = asyncHandler(async (req, res) => {
    const {id} = req.params
	const client = await Client.findById(id);
	return res.status(200).json({ client });
});
