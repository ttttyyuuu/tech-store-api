const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger");
const config = require("./config");
const customerRouter = require("./routes/customers");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "Магазин техники API Docs",
  }),
);

app.get("/", (req, res) => {
  res.json({
    message: "Добро пожаловать в API магазина техники!",
    docs: "/api-docs — интерактивная документация",
  });
});

app.use("/api/customers", customerRouter);

app.use((err, req, res, next) => {
  console.error("Ошибка:", err.message);
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Внутренняя ошибка сервера",
  });
});

const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Документация доступна: http://localhost:${PORT}/api-docs`);
});

const customerController = require("./controllers/customerController");
console.log(
  "CustomerController загружен:",
  !!customerController.getAllCustomers,
);
