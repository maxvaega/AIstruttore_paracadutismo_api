require("dotenv").config();

const express = require("express");
const { urlencoded, json } = require("body-parser");
const axios = require("axios");

const app = express();

// Parse application/x-www-form-urlencoded
app.use(
  urlencoded({
    extended: true,
  })
);

// Parse application/json
app.use(json());

// Test endpoint
app.get("/test", function (req, res) {
  res.status(200).send({ msg: "Hi :)" });
});

// Webhook verification for GET requests
app.get("/messaging-webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      console.error("Invalid verify token");
      res.sendStatus(403); // Forbidden
    }
  } else {
    console.error("Missing mode or token");
    res.sendStatus(403); // Forbidden
  }
});

// Webhook for POST requests
app.post("/messaging-webhook", async (req, res) => {
  const body = req.body;
  console.log(`Received webhook:`, body);

  // Respond immediately to Facebook with 200
  res.status(200).send("EVENT_RECEIVED");

  if (body.object === "instagram") {
    try {
      for (const entry of body.entry) {
        for (const webhookEvent of entry.messaging) {
          // Discard uninteresting events
          if ("read" in webhookEvent || "delivery" in webhookEvent || (webhookEvent.message && webhookEvent.message.is_echo)) {
            console.log("Ignoring uninteresting event");
            continue;
          }

          if (!webhookEvent.message || !webhookEvent.message.text) {
            console.error("Invalid message format");
            continue;
          }

          const senderPsid = webhookEvent.sender.id;
          if (senderPsid) {
            const msg = webhookEvent.message.text;
            console.log(`Processing message from ${senderPsid}: ${msg}`);

            // Make a POST request to the Facebook API
            await sendFacebookMessage(senderPsid, msg);
          }
        }
      }
    } catch (error) {
      console.error("Error processing webhook event:", error);
    }
  } else {
    console.error("Unhandled webhook event:", body.object);
  }
});

// Function to send message to Facebook API
const sendFacebookMessage = async (senderPsid, messageText) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.PAGE_ID}/messages`,
      {
        recipient: {
          id: senderPsid,
        },
        messaging_type: "RESPONSE",
        message: {
          text: messageText,
        },
        access_token: process.env.ACCESS_TOKEN,
      },
      {
        timeout: 5000, // Timeout of 5 seconds
      }
    );
    console.log(`Message sent to ${senderPsid}: ${messageText}`);
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error(`Error response from Facebook: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      // No response received from the server
      console.error("No response from Facebook:", error.request);
    } else {
      // Error setting up the request
      console.error("Error sending message:", error.message);
    }
  }
};

// Start the server (for local development)
const listener = app.listen(3000, () => {
  console.log(`The app is listening on port ${listener.address().port}`);
});

// Export the app for Vercel
module.exports = app;
