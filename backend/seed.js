require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');

const img = (name) => `https://picsum.photos/seed/${name}/400/300`;

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with 30 hours of battery life.',
    price: 59.99,
    category: 'Electronics',
    image: img('headphones'),
    stock: 25,
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracking, heart-rate monitor and notifications.',
    price: 89.5,
    category: 'Electronics',
    image: img('smartwatch'),
    stock: 15,
  },
  {
    name: 'Portable Speaker',
    description: 'Water-resistant speaker with deep bass.',
    price: 34.99,
    category: 'Electronics',
    image: img('speaker'),
    stock: 40,
  },
  {
    name: 'USB-C Charger 65W',
    description: 'Fast charger for laptops, tablets and phones.',
    price: 24.0,
    category: 'Electronics',
    image: img('charger'),
    stock: 60,
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Soft 100% cotton crew-neck t-shirt.',
    price: 12.99,
    category: 'Clothing',
    image: img('tshirt'),
    stock: 100,
  },
  {
    name: 'Denim Jacket',
    description: 'Classic mid-blue denim jacket.',
    price: 49.0,
    category: 'Clothing',
    image: img('jacket'),
    stock: 20,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight shoes with cushioned soles.',
    price: 69.95,
    category: 'Clothing',
    image: img('shoes'),
    stock: 30,
  },
  {
    name: 'Ceramic Mug Set',
    description: 'Set of four 350 ml ceramic mugs.',
    price: 19.99,
    category: 'Home',
    image: img('mugs'),
    stock: 50,
  },
  {
    name: 'LED Desk Lamp',
    description: 'Dimmable lamp with three colour modes.',
    price: 27.5,
    category: 'Home',
    image: img('lamp'),
    stock: 35,
  },
  {
    name: 'Scented Candle',
    description: 'Hand-poured soy candle, vanilla scent.',
    price: 9.99,
    category: 'Home',
    image: img('candle'),
    stock: 80,
  },
  {
    name: 'JavaScript Basics',
    description: 'A beginner-friendly guide to JavaScript.',
    price: 21.0,
    category: 'Books',
    image: img('jsbook'),
    stock: 45,
  },
  {
    name: 'Database Design Handbook',
    description: 'Practical guide to relational and NoSQL design.',
    price: 32.0,
    category: 'Books',
    image: img('dbbook'),
    stock: 18,
  },
];