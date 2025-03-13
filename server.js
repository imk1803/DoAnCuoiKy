const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');
const User = require('./models/User'); // Import User model
const path = require('path');

const app = express();
const PORT = 3000;

// ========================== KẾT NỐI CƠ SỞ DỮ LIỆU MONGODB ==========================
mongoose.connect('mongodb://localhost:27017/shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch(err => console.log('❌ Lỗi kết nối MongoDB:', err));

// ========================== CẤU HÌNH EXPRESS ==========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ========================== CẤU HÌNH SESSION ==========================
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/shop' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Phiên đăng nhập tồn tại 1 ngày
}));
// ========================== CẤU HÌNH EXPRESS-FLASH ==========================
const flash = require('express-flash');
app.use(flash());

// ========================== CẤU HÌNH PASSPORT ==========================
app.use(passport.initialize());
app.use(passport.session());

// Gán user vào locals để dùng trong EJS
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: 'Tài khoản không tồn tại' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Sai mật khẩu' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ========================== IMPORT ROUTERS ==========================
const cart = require('./routers/cart');
const products = require('./routers/products');
const search = require('./routers/search');
const users = require('./routers/users');
const checkout = require('./routers/checkout');
const about = require('./routers/about');
const adminRoutes = require('./routers/admin-index')
app.use('/admin', adminRoutes)
app.use('/', users);
app.use('/', products);
app.use('/', search);
app.use('/', cart);
app.use('/', checkout);
app.use('/', about);

// ========================== KHỞI ĐỘNG SERVER ==========================
app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));
