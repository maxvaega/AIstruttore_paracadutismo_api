require("dotenv").config();

// Required environment variables
const ENV_VARS = ["PAGE_ID", "APP_ID", "APP_SECRET", "VERIFY_TOKEN", "APP_URL"];

function checkEnvVars() {
  ENV_VARS.forEach(function (key) {
    if (!process.env[key]) {
      console.warn("WARNING: Missing the environment variable " + key);
    } else {
      // Check that urls use https
      if (["APP_URL", "SHOP_URL"].includes(key)) {
        const url = process.env[key];
        if (!url.startsWith("https://")) {
          console.warn(
            "WARNING: Your " + key + ' does not begin with "https://"'
          );
        }
      }
    }
  });
}

module.exports = checkEnvVars;
