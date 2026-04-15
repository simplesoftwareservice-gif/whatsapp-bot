export default async function handler(req, res) {

  const VERIFY_TOKEN = "hotel_token";

  if (req.method === "GET") {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Forbidden");
    }
  }

  if (req.method === "POST") {

    const body = req.body;

    if (body.entry) {

      const message = body.entry[0].changes[0].value.messages?.[0]?.text?.body;

      if (message) {

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "system",
                content: "Eres la recepcionista amable de un hotel llamado Hotel Alcampo."
              },
              {
                role: "user",
                content: message
              }
            ]
          })
        });

        const data = await response.json();

        console.log("Respuesta IA:", data);
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

}
