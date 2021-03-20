const { Client } = require("@elastic/elasticsearch");

const elasticUrl = process.env.ELASTIC_URL;
const esclient = new Client({ node: elasticUrl });

const index = "quotes";
const type = "quotes";

async function createIndex(index) {
  try {
    await esclient.indices.create({ index });
    console.log(`Created index ${index}`);
  } catch (err) {
    console.error(`An error occurred while creating the index ${index}:`);
    console.error(err);
  }
}

async function setQuotesMapping() {
  try {
    const schema = {
      quote: {
        type: "text",
      },
      author: {
        type: "text",
      },
    };

    await esclient.indices.putMapping({
      index,
      type,
      include_type_name: true,
      body: {
        properties: schema,
      },
    });

    console.log("Quotes mapping created successfully");
  } catch (err) {
    console.error("An error occurred while setting the quotes mapping:");
    console.error(err);
  }
}

async function checkConnection() {
  return new Promise(async (resolve) => {
    console.log("Checking connection to ElasticSearch...");
    let isConnected = false;
    while (!isConnected) {
      try {
        await esclient.cluster.health({});
        console.log("Successfully connected to ElasticSearch");
        isConnected = true;
      } catch (err) {
        console.error(err);
      }
    }
    resolve(true);
  });
}

const quotes = require("./data/quotes.json");

async function populateDatabase() {
  const esAction = {
    index: {
      _index: index,
      _type: type,
    },
  };

  const docs = [];
  for (const quote of quotes) {
    docs.push(esAction);
    docs.push(quote);
  }
  return esclient.bulk({ body: docs });
}

module.exports = {
  index,
  type,
  esclient,
  createIndex,
  setQuotesMapping,
  checkConnection,
  populateDatabase,
};
