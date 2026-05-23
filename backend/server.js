import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;

    console.log("User:", message);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${process.env.GROQ_API_KEY}`,
        },

        body: JSON.stringify({
         model:
  "llama-3.1-8b-instant",

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
    console.log(JSON.stringify(data, null, 2));

    console.log(data);

    const reply =
      data.choices?.[0]?.message
        ?.content ||
      "No response from AI";

    res.json({ reply });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      reply: "Server Error",
    });
  }
});

app.listen(5000, () => {

  console.log(
    "Server started on port 5000"
  );
});