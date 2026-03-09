const db = require("../db/db");
const AppError = require("../utils/AppError");

/**
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string|null} options.email
 * @returns {Array}
 */

exports.getAll = ({ page = 1, limit = 10, email = null }) => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, name, email, phone, registeredAt 
    FROM customers
  `;
  const params = [];

  if (email) {
    query += " WHERE email = ?";
    params.push(email.trim());
  }

  query += " ORDER BY registeredAt DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const stmt = db.prepare(query);
  return stmt.all(...params);
};

/**
 * @param {number|string} id
 * @returns {Object|null}
 */

exports.getById = (id) => {
  const stmt = db.prepare(`
    SELECT id, name, email, phone, registeredAt
    FROM customers
    WHERE id = ?
  `);
  return stmt.get(id);
};

/**
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.phone
 * @returns {Object}
 * throws AppError if email already exists
 */

exports.create = (data) => {
  const { name, email, phone } = data;

  const existing = db
    .prepare("SELECT id FROM customers WHERE email = ?")
    .get(email);
  if (existing) {
    throw new AppError("Клиент с таким email уже существует", 400);
  }

  const insertStmt = db.prepare("INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)");
  const info = insertStmt.run(name, email, phone);

  const newCustomer = db
    .prepare(
      `
    SELECT id, name, email, phone, registeredAt 
    FROM customers 
    WHERE id = ?
  `,
    )
    .get(info.lastInsertRowid);

  return newCustomer;
};

/**
 * @param {number} id
 * @param {Object} data
 */

exports.update = (id, data) => {
  throw new AppError("Обновление клиента не реализовано", 501);
};

/**
 * @param {number} id
 */

exports.delete = (id) => {
  throw new AppError("Удаление клиента не реализовано", 501);
};
