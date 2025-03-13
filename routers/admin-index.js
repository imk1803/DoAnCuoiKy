const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).send('Truy cập bị từ chối');
};

// ========================
//        DASHBOARD
// ========================
router.get('/dashboard', isAdmin, adminController.showDashboard);

// ========================
//         USERS
// ========================
router.get('/users', isAdmin, adminController.listUsers); // Danh sách người dùng
router.get('/users/:id/edit', isAdmin, adminController.showEditUser); // Form chỉnh sửa người dùng
router.put('/users/:id', isAdmin, adminController.updateUser); // Cập nhật người dùng
router.delete('/users/:id', isAdmin, adminController.deleteUser); // Xóa người dùng

// ========================
//        PRODUCTS
// ========================
router.get('/products', isAdmin, adminController.listProducts); // Danh sách sản phẩm
router.get('/products/new', isAdmin, adminController.showCreateProduct); // Form thêm sản phẩm
router.post('/products', isAdmin, adminController.createProduct); // Thêm sản phẩm
router.get('/products/:id/edit', isAdmin, adminController.showEditProduct); // Form chỉnh sửa sản phẩm
router.put('/products/:id', isAdmin, adminController.updateProduct); // Cập nhật sản phẩm
router.delete('/products/:id', isAdmin, adminController.deleteProduct); // Xóa sản phẩm

// ========================
//         ORDERS
// ========================
router.get('/orders', isAdmin, adminController.listOrders); // Danh sách đơn hàng
router.get('/orders/:id', isAdmin, adminController.showOrderDetail); // Chi tiết đơn hàng
router.patch('/orders/:id/status', isAdmin, adminController.updateOrderStatus); // Cập nhật trạng thái đơn hàng

module.exports = router;