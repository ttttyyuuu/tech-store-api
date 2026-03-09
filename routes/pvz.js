const express = require("express");
const router = express.Router();
const db = require("../db/db");

/**
 * @swagger
 * tags:
 *   name: PVZ
 *   description: Пункты выдачи заказов (список статический)
 */

/**
 * @swagger
 * /api/pvz:
 *   get:
 *     summary: Получить список всех пунктов выдачи
 *     tags: [PVZ]
 *     description: Возвращает все доступные ПВЗ (хардкод в БД)
 *     responses:
 *       200:
 *         description: Список ПВЗ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   address: { type: string }
 *                   city: { type: string }
 */
router.get("/", (req, res, next) => {
  try {
    const pvz = db.prepare("SELECT * FROM pvz ORDER BY city, address").all();
    res.json(pvz);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
