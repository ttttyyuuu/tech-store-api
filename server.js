const express = require("express");

const app = express();
const cors = require("cors");
const PORT = 3000;

app.use;
app.use(express.json());

app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Добро пожаловать.",
    docs: "/api-docs (будет позже)",
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
  console.log(`Сервер запущен на порту ${PORT}`);
});
