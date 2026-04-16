export default async function handler(req, res) {
  const VERIFY_TOKEN = "hotel_token";

  // Verificación del Webhook (GET)
  if (req.method === "GET") {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  // Recepción de mensajes (POST)
  if (req.method === "POST") {
    try {
      const body = req.body;
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
      const from = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;

      if (message) {
        // 1. Llamada a OpenAI (Cambiado a gpt-4o-mini)
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // <--- Nombre correcto del modelo
            messages: [
              { role: "system", content: "Eres la recepcionista amable de un hotel llamado Hotel Alcampo en Querétaro." },
              { role: "user", content: message }
            ]
          })
        });

        const aiData = await aiResponse.json();
        
        if (aiData.error) {
           console.error("Error de OpenAI:", aiData.error.message);
           return res.status(500).send("Error en OpenAI");
        }

        const reply = aiData.choices[0].message.content;

        // 2. Respuesta a WhatsApp
        await fetch(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: { body: reply }
          })
        });
      }
      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("Error procesando el webhook:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
}
