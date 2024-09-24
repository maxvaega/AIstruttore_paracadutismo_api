const express = require("express");

const app = express();

app.get("/test", function (req, res) {
  res.status(200).send({ msg: "ciao" });
});

app.listen(3000, () => console.log("Server ready on port 3000."));
