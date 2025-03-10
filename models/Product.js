const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // Link ảnh sản phẩm
    category: { type: String, required: true },
    rating: { type: Number, default: 0 }, // Mặc định là 0 nếu không có đánh giá
    description: { type: String, required: true }
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;
