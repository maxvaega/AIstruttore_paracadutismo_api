const crypto = require("crypto");

function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];
  console.log("#### verifyRequestSignature ###");
  if (!signature) {
    console.warn(`Couldn't find "x-hub-signature" in headers.`);
  } else {
    var elements = signature.split("=");
    var signatureHash = elements[1];
    var expectedHash = crypto
      .createHmac("sha1", process.env.APP_SECRET)
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

module.exports = verifyRequestSignature;
