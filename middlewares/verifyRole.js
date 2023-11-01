const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
	const authToken = req.headers.authorization
	if (!authToken) {
		return res.status(401).json({ message: 'Access denied. No token provided.' })
	}
	const token = authToken.split(' ')[1]
	try {
		const decode = jwt.verify(token, process.env.JWT_SECURITY)
		req.user = decode
		next()
	} catch (error) {
		return res.status(401).json({ message: 'Access denied. Invalid token.' })
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
			return res.status(403).json({ message: `Access denied. Allowed roles: admin.` })
		}
		next()
	})
}

const verifyEmployee = (req, res, next) => {
	verifyToken(req, res, () => {
		if (!roleCheck(req, ['employee'])) {
			return res.status(403).json({ message: `Access denied. Allowed roles: employee.` })
		}
		next()
	})
}

const verifyAdminOrEmployee = (req, res, next) => {
	verifyToken(req, res, () => {
		if (!roleCheck(req, ['admin', 'employee'])) {
			return res.status(403).json({ message: `Access denied. Allowed roles: admin, employee.` })
		}
		next()
	})
}

const verifyUserHimself = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.id !== req.params.id) {
			return res.status(403).json({ message: 'Access denied. Only User himself.' })
		}
		next()
	})
}

const verifyUserHimselfOrAdmin = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.id === req.params.id || req.user.role === 'admin') {
			next()
		} else {
			return res.status(403).json({ message: 'Access denied. Only User himself or Admin.' })
		}
	})
}

const verifyUserHimselfOrAdminOrEmployee = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.id === req.params.id || req.user.role === 'admin' || req.user.role === 'employee') {
			next()
		} else {
			return res.status(403).json({ message: 'Access denied. Only User himself or Admin or Employee.' })
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
