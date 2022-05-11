var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const { getipaddress } = require("./utils/session");

const queriesrouter = require("./routes/queries");
const tickersrouter = require("./routes/tickers");
const itemsrouter = require("./routes/items");
const favoritesrouter = require("./routes/favorites");
const signuprouter = require("./routes/signup");
const transactionsrouter = require("./routes/transactions");
const ballotrouter = require("./routes/ballot");
const devtestrouter = require("./routes/devtest");
const adminRouter = require("./routes/admin");
const itemstatsrouter = require("./routes/itemstats");
const testsrouter = require("./routes/tests");
const LOGGER = console.log;
const cors = require("cors");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  LOGGER(getipaddress(req));
  next();
});
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/queries", queriesrouter);
app.use("/tickers", tickersrouter);
app.use("/items", itemsrouter);
app.use("/favorites", favoritesrouter);
app.use("/signup", signuprouter);
app.use("/transactions", transactionsrouter);
app.use("/ballot", ballotrouter);
app.use("/devtest", devtestrouter);
app.use("/admin", adminRouter);
app.use("/itemstats", itemstatsrouter);
app.use("/tests", testsrouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const cron = require("node-cron"),
  moment = require("moment");
cron.schedule("*/1 * * * *", () => {
  console.log(moment().format("HH:mm:ss, YYYY-MM-DD"), "@nips");
});

module.exports = app;
