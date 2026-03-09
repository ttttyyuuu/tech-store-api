const db = require("../db/db");
const AppError = require("../utils/AppError");

exports.getAll = ({ page = 1, limit = 10, status = null, pvzId = null }) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT o.id, o.customerId, o.totalPrice, o.status, o.pvzId, o.createdAt,
           c.name AS customerName, p.address AS pvzAddress, p.city AS pvzCity
    FROM orders o
    JOIN customers c ON o.customerId = c.id
    JOIN pvz p ON o.pvzId = p.id
  `;
  const params = [];

  const conditions = [];
  if (status) {
    conditions.push("o.status = ?");
    params.push(status);
  }
  if (pvzId) {
    conditions.push("o.pvzId = ?");
    params.push(pvzId);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY o.createdAt DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  return db.prepare(query).all(...params);
};

exports.getById = (id) => {
  const order = db
    .prepare(
      `
    SELECT o.*, c.name AS customerName, p.address AS pvzAddress, p.city AS pvzCity
    FROM orders o
    JOIN customers c ON o.customerId = c.id
    JOIN pvz p ON o.pvzId = p.id
    WHERE o.id = ?
  `,
    )
    .get(id);

  if (!order) return null;

  const items = db
    .prepare(
      `
    SELECT productName, quantity, price
    FROM order_items
    WHERE orderId = ?
  `,
    )
    .all(id);

  return { ...order, items };
};

/**
 * @param {Object} data
 * @param {number} data.customerId
 * @param {number} data.pvzId
 * @param {string} data.status
 * @param {Array} data.items
 */
exports.create = (data) => {
  const { customerId, pvzId, status = "new", items = [] } = data;

  if (!items.length) {
    throw new AppError("Заказ должен содержать хотя бы один товар", 400);
  }
  const customerExists = db
    .prepare("SELECT 1 FROM customers WHERE id = ?")
    .get(customerId);
  if (!customerExists) throw new AppError("Клиент не найден", 404);
  const pvzExists = db.prepare("SELECT 1 FROM pvz WHERE id = ?").get(pvzId);
  if (!pvzExists) throw new AppError("ПВЗ не найден", 404);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  return db.transaction(() => {
    // 1. Создаём заказ
    const orderStmt = db.prepare(`
      INSERT INTO orders (customerId, totalPrice, status, pvzId)
      VALUES (?, ?, ?, ?)
    `);
    const orderInfo = orderStmt.run(customerId, totalPrice, status, pvzId);
    const orderId = orderInfo.lastInsertRowid;

    // 2. Добавляем позиции
    const itemStmt = db.prepare(`
      INSERT INTO order_items (orderId, productName, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    items.forEach((item) => {
      itemStmt.run(orderId, item.productName, item.quantity, item.price);
    });

    return exports.getById(orderId);
  })();
};

exports.update = (id, data) => {
  const { status, pvzId } = data;

  const updates = [];
  const params = [];

  if (status) {
    updates.push("status = ?");
    params.push(status);
  }
  if (pvzId) {
    updates.push("pvzId = ?");
    params.push(pvzId);
  }

  if (!updates.length) {
    throw new AppError("Не указаны поля для обновления", 400);
  }

  params.push(id);

  const stmt = db.prepare(`
    UPDATE orders
    SET ${updates.join(", ")}
    WHERE id = ?
  `);

  const info = stmt.run(...params);

  if (info.changes === 0) {
    throw new AppError("Заказ не найден", 404);
  }

  return exports.getById(id);
};

exports.delete = (id) => {
  const order = db.prepare("SELECT status FROM orders WHERE id = ?").get(id);
  if (!order) throw new AppError("Заказ не найден", 404);

  if (!["new", "canceled"].includes(order.status)) {
    throw new AppError(
      'Можно удалять только заказы со статусом "new" или "canceled"',
      409,
    );
  }

  db.prepare("DELETE FROM orders WHERE id = ?").run(id);
};
