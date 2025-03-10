const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Import model User

// Middleware kiểm tra đăng nhập
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// ========================== ROUTES NGƯỜI DÙNG ==========================

// Hiển thị trang đăng ký
router.get('/register', (req, res) => {
    res.render('register', { messages: req.flash() });
});

// Xử lý đăng ký
router.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        req.flash('error', 'Vui lòng điền đầy đủ thông tin!');
        return res.redirect('/register');
    }
    if (password !== confirmPassword) {
        req.flash('error', 'Mật khẩu nhập lại không khớp!');
        return res.redirect('/register');
    }

    try {
        let user = await User.findOne({ username });
        if (user) {
            req.flash('error', 'Tài khoản đã tồn tại!');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });

        await newUser.save();
        req.flash('success', 'Đăng ký thành công! Hãy đăng nhập.');
        res.redirect('/login');
    } catch (err) {
        req.flash('error', 'Lỗi server khi đăng ký tài khoản!');
        res.redirect('/register');
    }
});

// Hiển thị trang đăng nhập
router.get('/login', (req, res) => {
    res.render('login', { messages: req.flash() });
});

// Xử lý đăng nhập
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message || 'Sai tên đăng nhập hoặc mật khẩu!');
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/index');
        });
    })(req, res, next);
});

// Đăng xuất
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(() => res.redirect('/index'));
    });
});

// Trang cá nhân (cần đăng nhập)
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});

module.exports = router;
