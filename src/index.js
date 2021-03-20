const elastic = require("./elastic");
const { start } = require("./server");

async function setupElastic() {
  const isElasticReady = await elastic.checkConnection();
  if (isElasticReady) {
    const elasticIndex = await elastic.esclient.indices.exists({
      index: elastic.index,
    });

    if (!elasticIndex.body) {
      await elastic.createIndex(elastic.index);
      await elastic.setQuotesMapping();
      await elastic.populateDatabase();
    }
  }
}

setupElastic();

const server = start();

function handle(signal) {
  console.log(`Received ${signal}`);
  server.close(() => {
    console.log("Http server closed.");
  });
  process.exit(0);
}

process.on("SIGINT", handle);
process.on("SIGTERM", handle);
