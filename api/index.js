const axios = require("axios");

// Funzione di gestione degli errori personalizzata per la chiamata POST
const postWithRetries = async (url, data, maxRetries = 3, retryDelay = 1000) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      // Imposta il timeout a 5 secondi per evitare chiamate troppo lunghe
      const response = await axios.post(url, data, { timeout: 5000 });
      
      // Controlla se la risposta ha uno stato di successo (2xx)
      if (response.status >= 200 && response.status < 300) {
        console.log("Messaggio inviato con successo", response.data);
        return response.data;
      } else {
        console.error(`Errore nella risposta, codice: ${response.status}`);
      }
    } catch (error) {
      attempts++;
      // Riconosci i tipi di errore
      if (error.response) {
        // Errore ricevuto dal server (es: 4xx, 5xx)
        console.error(
          `Errore di risposta dal server, codice: ${error.response.status}, messaggio: ${error.response.data}`
        );
      } else if (error.request) {
        // Nessuna risposta dal server (problemi di rete, timeout)
        console.error("Errore di rete o timeout", error.message);
      } else {
        // Qualsiasi altro errore
        console.error("Errore sconosciuto", error.message);
      }

      if (attempts < maxRetries) {
        console.log(`Riprovo (${attempts}/${maxRetries}) tra ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay)); // Attesa prima di ritentare
      } else {
        console.error("Numero massimo di tentativi raggiunto. Abbandono.");
        throw error; // Se tutti i tentativi falliscono, solleva l'errore
      }
    }
  }
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Verifica del token per il webhook
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      console.log("Token di verifica non valido");
      res.status(403).send("Forbidden");
    }
  } else if (req.method === "POST") {
    const body = req.body;
    console.log("Ricevuto evento webhook");

    // Risponde immediatamente al chiamante per evitare timeout
    res.status(200).send("EVENT_RECEIVED");

    if (body.object === "instagram") {
      for (const entry of body.entry) {
        for (const webhookEvent of entry.messaging) {
          if (webhookEvent.message && webhookEvent.message.text) {
            const senderPsid = webhookEvent.sender.id;
            const message = webhookEvent.message.text;

            if (senderPsid) {
              const url = `https://graph.facebook.com/v20.0/${process.env.PAGE_ID}/messages`;
              const data = {
                recipient: { id: senderPsid },
                messaging_type: "RESPONSE",
                message: { text: message },
                access_token: process.env.ACCESS_TOKEN,
              };

              try {
                // Usa la funzione con gestione degli errori e retry
                await postWithRetries(url, data);
              } catch (error) {
                console.error("Errore nell'invio del messaggio dopo vari tentativi:", error);
              }
            }
          }
        }
      }
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Metodo ${req.method} non permesso`);
  }
}
