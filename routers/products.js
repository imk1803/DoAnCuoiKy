const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import model Product

// ========================== ROUTES QUẢN LÝ SẢN PHẨM ==========================
// Trang chủ, chuyển hướng đến /product
router.get('/', (req, res) => res.redirect('/product'));

// Trang danh sách sản phẩm trên trang chủ
router.get('/index', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('index', { products, user: req.user || null });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy danh sách sản phẩm");
    }
});

// Trang danh sách sản phẩm có phân trang
router.get('/product', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 4; // Số sản phẩm mỗi trang
    const skip = (page - 1) * limit;

    try {
        const totalProducts = await Product.countDocuments();
        const products = await Product.find().skip(skip).limit(limit);
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('product-list', { products, currentPage: page, totalPages });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi lấy danh sách sản phẩm");
    }
});

// Trang chi tiết sản phẩm
router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Sản phẩm không tồn tại");

        res.render('product-detail', { product });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy chi tiết sản phẩm");
    }
});

module.exports = router;
