const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");
const auth = require("../middleware/auth");

const validateCreateCustomer = (req, res, next) => next();
const validateUpdateCustomer = (req, res, next) => next();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Операции с клиентами магазина
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Получить список клиентов
 *     tags: [Customers]
 *     description: Возвращает клиентов с пагинацией и фильтром по email
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Количество клиентов на странице
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Фильтр по email (точное совпадение)
 *     responses:
 *       200:
 *         description: Список клиентов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
 *                   email: { type: string }
 *                   phone: { type: string }
 *                   registeredAt: { type: string, format: date-time }
 *       400:
 *         description: Некорректные параметры запроса
 */
router.get("/", customerController.getAllCustomers);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Получить клиента по ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID клиента
 *     responses:
 *       200:
 *         description: Данные клиента
 *       404:
 *         description: Клиент не найден
 */
router.get("/:id", customerController.getCustomerById);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Создать нового клиента
 *     tags: [Customers]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 pattern: '^\\+7\\(\\d{3}\\)\\d{3}-\\d{2}-\\d{2}$'
 *     responses:
 *       201:
 *         description: Клиент успешно создан
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       409:
 *         description: Email уже используется
 */
router.post(
  "/",
  auth,
  validateCreateCustomer,
  customerController.createCustomer,
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Обновить клиента (частичное обновление)
 *     tags: [Customers]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Клиент обновлён
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Клиент не найден
 */
router.put(
  "/:id",
  auth,
  validateUpdateCustomer,
  customerController.updateCustomer ||
    ((req, res) => res.status(501).json({ message: "Not implemented yet" })),
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Удалить клиента
 *     tags: [Customers]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Клиент удалён
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Клиент не найден
 *       409:
 *         description: Нельзя удалить клиента с активными заказами
 */
router.delete(
  "/:id",
  auth,
  customerController.deleteCustomer ||
    ((req, res) => res.status(501).json({ message: "Not implemented yet" })),
);

module.exports = router;
