export default async function handler(req, res) {

  if (req.method === "GET") {
    const VERIFY_TOKEN = "hotel_token";

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  if (req.method === "POST") {
    console.log("Mensaje recibido:", req.body);
    return res.sendStatus(200);
  }

}