const express = require("express");

const app = express();

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transationRouter = require("./routes/transaction.routes");

const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use("/api/accounts", accountRouter);

app.use("/api/transactions", transationRouter);

//Default route
app.get("/", ()=>{
  res.status(200).json({
    message:"Welcome to Asjad Bank Ledger Service..."
  })
})


module.exports = app;