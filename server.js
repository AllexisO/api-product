require('dotenv').config();
const express = require("express");
const { Client } = require("pg");

// New object from class Client
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

// Connection to DB
client.connect();

// Check connection to DB and get Time from DB
async function testDatabase() {
    console.log('Checking connection to DB ...');
    const result = await client.query('SELECT NOW()');
    console.log('Current time in DB is: ', result.rows[0]);
}

async function createProductsTable() {
    console.log('Creating table of products ...');

    const query = `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        brand VARCHAR(100) NOT NULL
    )`;

    await client.query(query);
    console.log('Table has been created');
}

async function checkTable() {
    console.log('Checking table structure ...');

    const query = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'products'
    `;

    const result = await client.query(query);
    // console.log('Что внутри result:', Object.keys(result)); // Добавьте эту строчку
    console.log('Fields of the products table ...');
    result.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}`);
    });
}

async function addProduct(name, category, price, description, brand) {
    console.log(`Adding product: ${name}`);

    const checkQuery = `SELECT id, name FROM products WHERE name = $1`;
    const existingProduct = await client.query(checkQuery, [name]);

    if (existingProduct.rows.length > 0) {
        console.log(`Product "${name}" already exist with ID: ${existingProduct.rows[0].id}`);
        return;
    }

    console.log(`Adding new product: ${name}`);
    const query = `
        INSERT INTO products (name, category, price, description, brand)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, price
    `;

    const result = await client.query(query, [name, category, price, description, brand]);
    console.log('Product added:', result.rows[0]);
}

async function getAllProducts() {
    console.log('Getting all products from DB ...');

    const query = `SELECT * FROM products ORDER BY id`;
    const result = await client.query(query);

    console.log(`Found products: ${result.rowCount}`);

    result.rows.forEach(product => {
        console.log(`ID: ${product.id} | ${product.name} | ${product.price} | ${product.category}`);
    });
}

async function getProductsByCategory(category) {
    console.log(`Looking products in category: ${category}`);

    const query = `SELECT * FROM products WHERE category = $1 ORDER BY id`;
    const result = await client.query(query, [category]);

    console.log(`Found products in category "${category}": ${result.rowCount}`);

    if (result.rowCount === 0) {
        console.log("No products found!");
        return;
    }

    result.rows.forEach(product => {
        console.log(`ID: ${product.id} | ${product.name} | ${product.price}`);
    });
}

async function updateProduct(id, name, category, price, description, brand) {
    console.log(`Updating product with ID: ${id}`);

    const query = `UPDATE products
        SET name = $1, category = $2, price = $3, description = $4, brand = $5
        WHERE id = $6
        RETURNING id, name, price`;

    const result = await client.query(query, [name, category, price, description, brand, id]);

    if (result.rowCount === 0) {
        console.log(`Product with ID ${id} was not found!`);
        return;
    }

    console.log('Product was updated:', result.rows[0]);
}

async function deleteProduct(id) {
    console.log(`Deleting product with ID: ${id}`);

    const query = `DELETE FROM products WHERE id = $1 RETURNING id, name`;

    const result = await client.query(query, [id]);

    if (result.rowCount === 0) {
        console.log(`Product with ID ${id} was not found!`);
        return;
    }

    console.log('Product was deleted:', result.rows[0]);
}

testDatabase();
createProductsTable();
checkTable();
// addProduct('iPhone 15 Pro Max', 'smartphone', 1299.99, 'The iPhone 15 Pro and iPhone 15 Pro Max are smartphones that were developed and marketed by Apple Inc.', 'Apple');
// addProduct('iPhone 15 Pro', 'smartphone', 999.99, ' Explore the Apple iPhone 15 Pro with a titanium frame, Pro chip, advanced camera system, and ProRes video capabilities', 'Apple');
// addProduct('Samsung S25 Ultra', 'smartphone', 1199.49, 'Galaxy S25 Ultra smartphone featuring advanced AI features with enhanced camera and display technology', 'Samsung');
// addProduct('MacBook Pro 14', 'laptops', 1999.99, 'Professional laptop with M3 chip', 'Apple');
// addProduct('Dell XPS 15', 'laptops', 1599.99, 'High-performance laptop for creators', 'Dell');
// addProduct('iPad Pro 12.9', 'tablets', 1099.99, 'Professional tablet with M2 chip', 'Apple');
// addProduct('Samsung Galaxy Tab S9', 'tablets', 799.99, 'Premium Android tablet with S Pen', 'Samsung');
getAllProducts();
// getProductsByCategory('TV');
// updateProduct(4, 'MacBook Pro 14 M3 Max', 'laptops', 2299.99, 'Updated professional laptop with M3 Max chip', 'Apple');
// deleteProduct(8);

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>HELLO</h1>')
});

app.get('/api/products', async (req, res) => {
    const query = `SELECT * FROM products ORDER BY id`;
    const result = await client.query(query);

    res.json({
        success: true,
        count: result.rowCount,
        data: result.rows
    });
});

app.post('/api/products', async (req, res) => {
    const { name, category, price, description, brand } = req.body;

    // Check required fields
    if (!name || !category || !price || !brand) {
        return res.status(400).json({
            success: false,
            error: 'Field name, category, price and brand are required!'
        });
    }

    // Check duplicates
    const checkQuery = `SELECT id FROM products WHERE name = $1`;
    const existing = await client.query(checkQuery, [name]);

    if(existing.rows.length > 0) {
        return res.status(409).json({
            success: false,
            error: `Product "${name}" already exist`
        });
    }

    // Adding product
    const query = `
        INSERT INTO products (name, category, price, description, brand)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const result = await client.query(query, [name, category, price, description, brand]);

    res.status(201).json({
        success: true,
        data: result.rows[0]
    });
});

app.get('/api/products/:id', async (req, res) => {
    
});

app.listen(3000, () => {
    console.log('Server is running on port 3000!');
});
