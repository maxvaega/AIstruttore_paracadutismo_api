app.post("/messaging-webhook", (req, res) => {
  console.time("webhook_received");  // Inizia a misurare il tempo

  const body = req.body;
  console.log(`Received webhook:`, body);

  // Rispondi immediatamente al webhook con 200
  res.status(200).send("EVENT_RECEIVED");
  console.timeLog("webhook_received", "Response sent");

  // Esegui le operazioni asincrone in background
  (async () => {
    if (body.object === "instagram") {
      try {
        for (const entry of body.entry) {
          for (const webhookEvent of entry.messaging) {
            // Scarta eventi non rilevanti
            if (
              "read" in webhookEvent ||
              "delivery" in webhookEvent ||
              (webhookEvent.message && webhookEvent.message.is_echo)
            ) {
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

              // Log prima di inviare il messaggio
              console.timeLog("webhook_received", "Before sending message");

              // Esegui la chiamata POST all'API di Facebook
              await sendFacebookMessage(senderPsid, msg);

              console.timeLog("webhook_received", "Message sent");
            }
          }
        }
      } catch (error) {
        console.error("Error processing webhook event:", error);
      }
    } else {
      console.error("Unhandled webhook event:", body.object);
    }

    console.timeEnd("webhook_received");  // Termina la misurazione del tempo
  })();
});
