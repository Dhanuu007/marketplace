import { useState } from "react";
import { apiStreamRequest } from "../../../services/apiClient.js";
import "./MarketplaceAssistant.css";

let messageId = 1;

const quickQuestions = [
  "What is MarketPalce?",
  "How does this website work?",
  "How do I buy a product?",
  "How do I access my purchase?",
];

function renderFormattedText(text) {
  const lines = String(text ?? "").split("\n");

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return (
        <div
          key={`empty-${index}`}
          className="marketplace-assistant__message-spacer"
        />
      );
    }

    const isBullet = /^[-*]\s+/.test(trimmedLine);

    const content = isBullet
      ? trimmedLine.replace(/^[-*]\s+/, "")
      : trimmedLine;

    const parts = content.split(/(\*\*[^*]+\*\*)/g);

    const formattedContent = parts.map(
      (part, partIndex) => {
        if (
          part.startsWith("**") &&
          part.endsWith("**") &&
          part.length > 4
        ) {
          return (
            <strong key={partIndex}>
              {part.slice(2, -2)}
            </strong>
          );
        }

        return part;
      },
    );

    if (isBullet) {
      return (
        <div
          key={`bullet-${index}`}
          className="marketplace-assistant__bullet"
        >
          <span
            className="marketplace-assistant__bullet-marker"
            aria-hidden="true"
          >
            •
          </span>

          <span>{formattedContent}</span>
        </div>
      );
    }

    return (
      <div
        key={`line-${index}`}
        className="marketplace-assistant__message-line"
      >
        {formattedContent}
      </div>
    );
  });
}

export default function MarketplaceAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [isStreaming, setIsStreaming] =
    useState(false);

  const [streamingMessageId, setStreamingMessageId] =
    useState(null);

  const [messages, setMessages] = useState([
    {
      id: messageId++,
      sender: "assistant",
      text:
        "Hi! 👋 I'm the MarketPalce Assistant. How can I help you?",
    },
  ]);

  const sendMessage = async (
    text = message,
  ) => {
    const trimmedMessage =
      text.trim();

    if (
      !trimmedMessage ||
      isStreaming
    ) {
      return;
    }

    const userMessage = {
      id: messageId++,
      sender: "user",
      text: trimmedMessage,
    };

    const assistantMessageId =
      messageId++;

    const assistantMessage = {
      id: assistantMessageId,
      sender: "assistant",
      text: "",
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      assistantMessage,
    ]);

    setMessage("");

    setIsStreaming(true);

    setStreamingMessageId(
      assistantMessageId,
    );

    try {
      const response =
        await apiStreamRequest(
          "/chatbot/message",
          {
            method: "POST",

            body: {
              message: trimmedMessage,
            },
          },
        );

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";

      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) {
          break;
        }

        buffer +=
          decoder.decode(
            value,
            {
              stream: true,
            },
          );

        const events =
          buffer.split("\n\n");

        buffer =
          events.pop() ?? "";

        for (const event of events) {
          const dataLine =
            event
              .split("\n")
              .find((line) =>
                line.startsWith(
                  "data: ",
                ),
              );

          if (!dataLine) {
            continue;
          }

          const payload =
            JSON.parse(
              dataLine.slice(6),
            );

          if (payload.error) {
            throw new Error(
              payload.error,
            );
          }

          if (payload.text) {
            setMessages(
              (previous) =>
                previous.map(
                  (item) =>
                    item.id ===
                    assistantMessageId
                      ? {
                          ...item,
                          text:
                            item.text +
                            payload.text,
                        }
                      : item,
                ),
            );
          }
        }
      }

      const remaining =
        decoder.decode();

      if (remaining) {
        buffer += remaining;
      }
    } catch (error) {
      setMessages(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              assistantMessageId
                ? {
                    ...item,
                    text:
                      error?.message ??
                      "Sorry, something went wrong. Please try again.",
                  }
                : item,
          ),
      );
    } finally {
      setIsStreaming(false);

      setStreamingMessageId(null);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    sendMessage();
  };

  const streamingMessage =
    messages.find(
      (item) =>
        item.id ===
        streamingMessageId,
    );

  return (
    <>
      {isOpen && (
        <div className="marketplace-assistant">
          <div className="marketplace-assistant__header">
            <div>
              <h3>
                MarketPalce Assistant
              </h3>

              <span>
                Here to help you
              </span>
            </div>

            <button
              type="button"
              className="marketplace-assistant__close"
              onClick={() =>
                setIsOpen(false)
              }
              aria-label="Close assistant"
            >
              ×
            </button>
          </div>

          <div className="marketplace-assistant__messages">
            {messages.map((item) => {
              if (
                item.sender === "assistant" &&
                !item.text
              ) {
                return null;
              }

              return (
                <div
                  key={item.id}
                  className={`marketplace-assistant__message marketplace-assistant__message--${item.sender}`}
                >
                  {item.sender === "assistant"
                    ? renderFormattedText(item.text)
                    : item.text}
                </div>
              );
            })}

            {isStreaming &&
              streamingMessage &&
              !streamingMessage.text && (
                <div className="marketplace-assistant__message marketplace-assistant__message--assistant">
                  <div
                    className="marketplace-assistant__typing"
                    aria-label="MarketPalce Assistant is typing"
                  >
                    •••
                  </div>
                </div>
              )}

            {messages.length === 1 &&
              !isStreaming && (
                <div className="marketplace-assistant__quick-questions">
                  {quickQuestions.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          sendMessage(
                            question,
                          )
                        }
                      >
                        {question}
                      </button>
                    ),
                  )}
                </div>
              )}
          </div>

          <form
            className="marketplace-assistant__input-area"
            onSubmit={handleSubmit}
          >
            <input
              id="marketplace-assistant-message"
              name="message"
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value,
                )
              }
              placeholder="Ask me anything..."
              aria-label="Ask MarketPalce Assistant"
              disabled={isStreaming}
            />

            <button
              type="submit"
              aria-label="Send message"
              disabled={
                isStreaming ||
                !message.trim()
              }
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={`marketplace-assistant__floating-button ${
          isOpen
            ? "marketplace-assistant__floating-button--open"
            : ""
        }`}
        onClick={() =>
          setIsOpen(
            (previous) =>
              !previous,
          )
        }
        aria-label="Open MarketPalce Assistant"
      >
        {isOpen ? "×" : "🤖"}
      </button>
    </>
  );
}