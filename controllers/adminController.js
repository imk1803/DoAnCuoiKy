const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Cấu hình upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
}).single('image');

module.exports = {
  // ========================
  //        DASHBOARD
  // ========================
  showDashboard: async (req, res) => {
    try {
      const stats = {
        totalUsers: await User.countDocuments(),
        totalProducts: await Product.countDocuments(),
        totalOrders: await Order.countDocuments(),
        recentOrders: await Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId'),
      };
      res.render('admin/dashboard', { stats });
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi server');
    }
  },

  // ========================
  //         USERS
  // ========================
  listUsers: async (req, res) => {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.render('admin/users', { users });
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi server');
    }
  },

  showEditUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.render('admin/edit-user', { user });
    } catch (error) {
      console.error(error);
      res.redirect('/admin/users');
    }
  },

  updateUser: async (req, res) => {
    try {
      const { username, role, newPassword } = req.body;
      const updateData = { username, role };

      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateData.password = hashedPassword;
      }

      await User.findByIdAndUpdate(req.params.id, updateData);
      res.redirect('/admin/users');
    } catch (error) {
      console.error(error);
      res.redirect('/admin/users');
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.redirect('/admin/users');
    } catch (error) {
      console.error(error);
      res.redirect('/admin/users');
    }
  },

  // ========================
  //        PRODUCTS
  // ========================
  listProducts: async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.render('admin/products', { products });
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi server');
    }
  },

  showCreateProduct: (req, res) => {
    res.render('admin/new-product');
  },

  createProduct: (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).send(err.message);
      }

      try {
        const { name, price, category, description } = req.body;
        const newProduct = new Product({
          name,
          price,
          category,
          description,
          image: `/uploads/${req.file.filename}`,
        });

        await newProduct.save();
        res.redirect('/admin/products');
      } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
      }
    });
  },

  showEditProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      res.render('admin/edit-product', { product });
    } catch (error) {
      console.error(error);
      res.redirect('/admin/products');
    }
  },

  updateProduct: (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).send(err.message);
      }

      try {
        const { name, price, category, description } = req.body;
        const updateData = {
          name,
          price,
          category,
          description,
        };

        if (req.file) {
          updateData.image = `/uploads/${req.file.filename}`;
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/products');
      } catch (error) {
        console.error(error);
        res.redirect('/admin/products');
      }
    });
  },

  deleteProduct: async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.redirect('/admin/products');
    } catch (error) {
      console.error(error);
      res.redirect('/admin/products');
    }
  },

  // ========================
  //         ORDERS
  // ========================
  listOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('userId');
      res.render('admin/orders', { orders });
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi server');
    }
  },

  showOrderDetail: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('userId')
        .populate('products.productId');
      res.render('admin/order-detail', { order });
    } catch (error) {
      console.error(error);
      res.redirect('/admin/orders');
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const validStatuses = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ];

      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );
      res.json({ success: true, status: order.status });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Cập nhật thất bại' });
    }
  },
};