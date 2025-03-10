const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Fix: Đúng đường dẫn đến model Product

// ========================== ROUTE TÌM KIẾM SẢN PHẨM ==========================
router.get('/search', async (req, res) => {
    try {
        // Lấy từ khóa tìm kiếm từ query string, nếu không có thì để rỗng
        const query = req.query.q ? req.query.q.trim().toLowerCase() : "";

        // Phân trang: lấy số trang từ query string, mặc định là 1
        const page = parseInt(req.query.page) || 1;
        const limit = 4; // Số sản phẩm mỗi trang
        const skip = (page - 1) * limit;

        // Kiểm tra nếu không có từ khóa thì lấy tất cả sản phẩm
        let filter = {};
        if (query) {
            filter = {
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { category: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            };
        }

        // Đếm tổng số sản phẩm phù hợp với bộ lọc
        const totalProducts = await Product.countDocuments(filter);

        // Lấy sản phẩm theo bộ lọc với phân trang
        const products = await Product.find(filter).skip(skip).limit(limit);

        // Tính tổng số trang
        const totalPages = Math.ceil(totalProducts / limit);

        // Render giao diện, truyền thêm currentPage, totalPages và query để hiển thị trên UI
        res.render('product-list', { products, currentPage: page, totalPages, query });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi tìm kiếm sản phẩm");
    }
});

module.exports = router;
