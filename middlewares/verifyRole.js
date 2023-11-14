const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
	const authToken = req.headers.authorization
	if (!authToken) {
		return res.status(401).json({ message: 'ممنوع الوصول، لا يوجد رمز.' })
	}
	const token = authToken.split(' ')[1]
	try {
		const decode = jwt.verify(token, process.env.JWT_SECURITY)
		req.user = decode
		next()
	} catch (error) {
		return res.status(401).json({ message: 'ممنوع الوصول، رمز غير صالح.' })
	}
}

const roleCheck = (req, allowedRoles) => {
	if (!allowedRoles.includes(req.user.role)) {
		return false
	}
	return true
}

const verifyAdmin = (req, res, next) => {
	verifyToken(req, res, () => {
		if (!roleCheck(req, ['admin'])) {
			return res.status(403).json({ message: `ممنوع الوصول، الحالات المسموحة: الادمن.` })
		}
		next()
	})
}

const verifyEmployee = (req, res, next) => {
	verifyToken(req, res, () => {
		if (!roleCheck(req, ['employee'])) {
			return res.status(403).json({ message: `ممنوع الوصول، الحالات المسموحة: الموظف.` })
		}
		next()
	})
}

const verifyAdminOrEmployee = (req, res, next) => {
	verifyToken(req, res, () => {
		if (!roleCheck(req, ['admin', 'employee'])) {
			return res.status(403).json({ message: `ممنوع الوصول، الحالات المسموحة: الادمن، الموظف.` })
		}
		next()
	})
}

const verifyUserHimself = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.id !== req.params.id) {
			return res.status(403).json({ message: 'ممنوع الوصول، الحالات المسموحة: المستخدم نفسه.' })
		}
		next()
	})
}

const verifyUserHimselfOrAdmin = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.id === req.params.id || req.user.role === 'admin') {
			next()
		} else {
			return res.status(403).json({ message: 'ممنوع الوصول، الحالات المسموحة: المستخدم نفسه، الادمن.' })
		}
	})
}

const verifyUserHimselfOrAdminOrEmployee = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.id === req.params.id || req.user.role === 'admin' || req.user.role === 'employee') {
			next()
		} else {
			return res.status(403).json({ message: 'ممنوع الوصول، الحالات المسموحة: المستخدم نفسه، الموظف، الادمن.' })
		}
	})
}

module.exports = {
	verifyToken,
	verifyAdmin,
	verifyEmployee,
	verifyUserHimself,
	verifyUserHimselfOrAdmin,
	verifyUserHimselfOrAdminOrEmployee,
	verifyAdminOrEmployee,
}
