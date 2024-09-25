# AIstruttore_paracadutismo_api
API per Aistruttore di paracadutismo

Links:
- https://developers.facebook.com/docs/messenger-platform/
- https://developers.facebook.com/docs/messenger-platform/overview
- https://developers.facebook.com/docs/messenger-platform/send-messages/
- https://developers.facebook.com/docs/messenger-platform/webhooks
- https://developers.facebook.com/docs/messenger-platform/webhooks#verification-requests
- https://github.com/fbsamples/original-coast-clothing/blob/main/app.js

Frasi Utili
- La messaggistica di Instagram è disponibile per qualsiasi account di Instagram per professionisti per aziende e per creator.
- Accesso avanzato e accesso standard => Avanzato sono gli admin/tester/admin, stanrdard tutti
- Devi completare la verifica dell'azienda se la tua app verrà utilizzata da utenti dell'app che non hanno un ruolo al suo interno o in un Business Manager che ha reclamato l'app.




# Punti per sviluppo codice
### ID assegnati a Instagram.
Quando una persona invia un messaggio a un account Instagram per professionisti, viene creato un ID assegnato a Instagram che rappresenta quella persona su quell'app.
Forse potremmo usare questo codice come "thread". Sarà sempre lo stesso thread anche dopo N mesi :)




# Pezzi di codice
```js
curl -X POST -H "Content-Type: application/json" -d '{
  "recipient":{
    "id":"{PSID}"
  },
  "messaging_type": "RESPONSE",
  "message":{
    "text":"Hello, world!"
  }
}' "https://graph.facebook.com/v20.0/{PAGE-ID}/messages?access_token={PAGE-ACCESS-TOKEN}"
```