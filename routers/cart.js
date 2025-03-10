const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 
const session = require('express-session');

// Middleware: Đảm bảo req.session.cart luôn tồn tại
router.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
});

// ========================== THÊM SẢN PHẨM VÀO GIỎ HÀNG ==========================
router.post('/cart/add/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        // Kiểm tra nếu sản phẩm đã có trong giỏ, tăng số lượng
        const existingIndex = req.session.cart.findIndex(item => item._id.toString() === product._id.toString());
        if (existingIndex !== -1) {
            req.session.cart[existingIndex].quantity = (req.session.cart[existingIndex].quantity || 1) + 1;
        } else {
            // Nếu chưa có, thêm sản phẩm mới với quantity mặc định là 1
            req.session.cart.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        req.session.save(() => {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({ success: true, cart: req.session.cart });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi khi thêm vào giỏ hàng" });
    }
});

// ========================== TĂNG SỐ LƯỢNG SẢN PHẨM ==========================
router.post('/cart/increment/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = req.session.cart.findIndex(item => item._id.toString() === id.toString());
        if (index !== -1) {
            req.session.cart[index].quantity = (req.session.cart[index].quantity || 1) + 1;
        }
        req.session.save(() => {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({ success: true, cart: req.session.cart });
            }
            res.redirect('/cart');
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi tăng số lượng sản phẩm" });
    }
});

// ========================== GIẢM SỐ LƯỢNG SẢN PHẨM ==========================
router.post('/cart/decrement/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = req.session.cart.findIndex(item => item._id.toString() === id.toString());
        if (index !== -1) {
            // Nếu số lượng > 1, giảm đi 1; nếu =1, xóa mục đó khỏi giỏ hàng
            if ((req.session.cart[index].quantity || 1) > 1) {
                req.session.cart[index].quantity = (req.session.cart[index].quantity || 1) - 1;
            } else {
                req.session.cart.splice(index, 1);
            }
        }
        req.session.save(() => {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({ success: true, cart: req.session.cart });
            }
            res.redirect('/cart');
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi giảm số lượng sản phẩm" });
    }
});

// ========================== XÓA SẢN PHẨM KHỎI GIỎ HÀNG ==========================
router.post('/cart/remove/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        if (!isNaN(index) && index >= 0 && index < req.session.cart.length) {
            req.session.cart.splice(index, 1);
        }
        req.session.save(() => {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({ success: true, cart: req.session.cart });
            }
            res.redirect('/cart');
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi xóa sản phẩm khỏi giỏ hàng" });
    }
});

// ========================== XEM GIỎ HÀNG ==========================
router.get('/cart', (req, res) => {
    res.render('cart', { cart: req.session.cart });
});

module.exports = router;
