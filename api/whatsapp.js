import OpenAI from "openai";

export default async function handler(req, res) {

  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "Eres recepcionista de un hotel y respondes clientes por WhatsApp de forma amable."
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  const reply = completion.choices[0].message.content;

  res.status(200).json({ reply });

}
