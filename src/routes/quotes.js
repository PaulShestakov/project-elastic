const express = require("express");
const { esclient, index, type } = require("../elastic");

async function queryQuotes(req) {
  const query = {
    query: {
      match: {
        quote: {
          query: req.text,
          operator: "and",
          fuzziness: "auto",
        },
      },
    },
  };

  const {
    body: { hits },
  } = await esclient.search({
    from: req.page || 0,
    size: req.limit || 100,
    index: index,
    type: type,
    body: query,
  });

  const results = hits.total.value;
  const values = hits.hits.map((hit) => {
    return {
      id: hit._id,
      quote: hit._source.quote,
      author: hit._source.author,
      score: hit._score,
    };
  });

  return {
    results,
    values,
  };
}

async function insertNewQuote(quote, author) {
  return esclient.index({
    index,
    type,
    body: {
      quote,
      author,
    },
  });
}

const quotesRouter = express.Router();

async function getQuotes(req, res) {
  const query = req.query;
  if (!query.text) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter: text",
    });
    return;
  }
  try {
    const result = await queryQuotes(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
}

async function addQuote(req, res) {
  const body = req.body;
  if (!body.quote || !body.author) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter(s): 'body' or 'author'",
    });
    return;
  }
  try {
    const result = await insertNewQuote(body.quote, body.author);
    res.json({
      success: true,
      data: {
        id: result.body._id,
        author: body.author,
        quote: body.quote,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Unknown error." });
  }
}

quotesRouter.route("/").get(getQuotes);
quotesRouter.route("/new").post(addQuote);

module.exports = { quotesRouter };
