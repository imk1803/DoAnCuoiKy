const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    res.status(403).send('Truy cập bị từ chối');
}

// ========================
//         USERS
// ========================
router.get('/users', isAdmin, adminController.listUsers)
router.get('/users/:id/edit', isAdmin, adminController.showEditUser)
router.post('/users/:id/update', isAdmin, adminController.updateUser)
router.post('/users/:id/delete', isAdmin, adminController.deleteUser)

// ========================
//        PRODUCTS
// ========================
router.get('/products', isAdmin, adminController.listProducts)
router.get('/products/new', isAdmin, adminController.showCreateProduct)
router.post('/products', isAdmin, adminController.createProduct)
router.get('/products/:id/edit', isAdmin, adminController.showEditProduct)
router.post('/products/:id/update', isAdmin, adminController.updateProduct)
router.post('/products/:id/delete', isAdmin, adminController.deleteProduct)

// ========================
//         ORDERS
// ========================
router.get('/orders', isAdmin, adminController.listOrders)
router.get('/orders/:id', isAdmin, adminController.showOrderDetail)
router.post('/orders/:id/status', isAdmin, adminController.updateOrderStatus)

// ========================
//        DASHBOARD
// ========================
router.get('/dashboard', isAdmin, adminController.showDashboard)

module.exports = router