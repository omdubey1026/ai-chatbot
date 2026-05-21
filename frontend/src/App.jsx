import {
  useState,
  useRef,
  useEffect,
} from "react";

import "./App.css";

import ReactMarkdown from "react-markdown";

import { Prism as SyntaxHighlighter }
from "react-syntax-highlighter";

import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {

  const [message, setMessage] =
    useState("");

  const [chat, setChat] = useState(() => {

    const savedChats =
      localStorage.getItem("chat");

    return savedChats
      ? JSON.parse(savedChats)
      : [];
  });

  const [loading, setLoading] =
    useState(false);

  const chatEndRef = useRef(null);

  const recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  const mic = recognition
    ? new recognition()
    : null;

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [chat]);

  useEffect(() => {

    localStorage.setItem(
      "chat",
      JSON.stringify(chat)
    );

  }, [chat]);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      text: message,
    };

    setChat((prev) => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);

    const res = await fetch(
      "https://ai-chatbot-g3k3.onrender.com",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          message,
        }),
      }
    );

    const data = await res.json();

    let currentText = "";

    const botMessage = {
      role: "bot",
      text: "",
    };

    setChat((prev) => [
      ...prev,
      botMessage,
    ]);

    for (
      let i = 0;
      i < data.reply.length;
      i++
    ) {

      currentText += data.reply[i];

      await new Promise((resolve) =>
        setTimeout(resolve, 15)
      );

      setChat((prev) => {

        const updatedChat = [
          ...prev,
        ];

        updatedChat[
          updatedChat.length - 1
        ].text = currentText;

        return updatedChat;
      });
    }
    const speech = new SpeechSynthesisUtterance(
  data.reply
);

speech.lang = "en-US";

window.speechSynthesis.speak(speech);

    setLoading(false);

    setMessage("");
  };

  const clearChat = () => {

    setChat([]);

    localStorage.removeItem(
      "chat"
    );
  };

  const startListening = () => {

    if (!mic) {

      alert(
        "Speech Recognition not supported"
      );

      return;
    }

    mic.start();

    mic.onresult = (event) => {

      const transcript =
        event.results[0][0].transcript;

      setMessage(transcript);
    };
  };

  return (

    <div className="app">

      <div className="sidebar">

        <button
          className="new-chat"
          onClick={clearChat}
        >
          + New Chat
        </button>

        <div className="sidebar-history">

          <p>Chat History</p>

          {chat
            .slice(0, 5)
            .map((msg, index) => (

              <div
                key={index}
                className="history-item"
              >
                {msg.text.slice(0, 20)}
              </div>

            ))}

        </div>

      </div>

      <div className="container">

        <h1>AI Chatbot</h1>

        <div className="chat-box">

          {chat.map((msg, index) => (

            <div
              key={index}
              className={
                msg.role === "user"
                  ? "user"
                  : "bot"
              }
            >

              <ReactMarkdown
                components={{
                  code({
                    inline,
                    className,
                    children,
                    ...props
                  }) {

                    const match =
                      /language-(\w+)/.exec(
                        className || ""
                      );

                    return !inline &&
                      match ? (

                      <SyntaxHighlighter
                        style={oneDark}
                        language={
                          match[1]
                        }
                        PreTag="div"
                        {...props}
                      >
                        {String(
                          children
                        ).replace(
                          /\n$/,
                          ""
                        )}
                      </SyntaxHighlighter>

                    ) : (

                      <code
                        className={
                          className
                        }
                        {...props}
                      >
                        {children}
                      </code>

                    );
                  },
                }}
              >
                {msg.text}
              </ReactMarkdown>

            </div>

          ))}

          {loading && (

            <div className="bot">
              Typing...
            </div>

          )}

          <div ref={chatEndRef}></div>

        </div>

        <div className="input-area">

          <input
            type="text"
            placeholder="Type message..."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            onKeyDown={(e) => {

              if (
                e.key === "Enter"
              ) {

                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
          >
            Send
          </button>

          <button
            onClick={startListening}
          >
            🎤
          </button>

        </div>

      </div>

    </div>

  );
}

export default App;