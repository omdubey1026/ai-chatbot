import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;

    console.log("User Message:", message);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",

          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response from AI";

    res.json({
      reply,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }

});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});