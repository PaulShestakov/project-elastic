const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { quotesRouter } = require("./routes/quotes");

const app = express();
const port = process.env.PORT;

const start = () => {
  app
    .use(cors())
    .use(express.urlencoded())
    .use(express.json())
    .use("/quotes", quotesRouter)
    .use("/health", (req, res) => {
      res.sendStatus(200);
    });

  const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });

  return server;
};

module.exports = { start };
