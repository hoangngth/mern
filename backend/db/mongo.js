const { MongoClient, ServerApiVersion } = require("mongodb");

const password = "R0xy@rts";
const uri = `mongodb+srv://hoangnt:${encodeURIComponent(
  password
)}@cluster0.rex8x.mongodb.net/places?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

module.exports = client;
