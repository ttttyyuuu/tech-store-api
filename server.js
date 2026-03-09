const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger");

const app = express();
const { PORT } = require("./config");

app.use;
app.use(express.json());

app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

app.use(
  `/api-docs`,
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
    customerSiteTitle: "Магазин техники API",
  }),
);

app.get("/", (req, res) => {
  res.json({
    message: "Добро пожаловать.",
    docs: "/api-docs",
  });
});

app.use((err, req, res, next) => {
  console.error("Ошибка:", err);
  console.error(err, stack);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Внутренняя ошибка сервера",
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту http://localhost:${PORT}`);
  console.log(
    `Документация доступна по адресу http://localhost:${PORT}/api-docs`,
  );
});

const customerController = require("./controllers/customerController");
console.log(
  "CustomerController загружен:",
  !!customerController.getAllCustomers,
);
