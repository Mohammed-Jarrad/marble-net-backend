const mogoose = require('mongoose');

const clientSchema = new mogoose.Schema(
	{
		image: {
			type: {
				url: String,
				publicId: String,
			},
			required: [true, 'صورة الزبون مطلوبة.'],
		},
		name: {
			type: String,
			required: true,
            unique: true
		},
	},
	{
		timestamps: true,
	},
);

const Client = mogoose.model('Client', clientSchema);

module.exports = { Client };
