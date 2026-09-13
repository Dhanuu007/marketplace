import { useState } from "react";
import {
  apiRequest,
  apiStreamRequest,
} from "../../../services/apiClient.js";
import "./MarketplaceAssistant.css";
import { useAuth } from "../auth/useAuth.js";
import { updateDashboardColor } from "../auth/authApi.js";

let messageId = 1;


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

  const auth = useAuth();

  const userRole = auth.user?.role;

  const defaultDashboardColor = "#008080";

  const dashboardColorOptions = [
    "#008080",
    "#2563eb",
    "#7c3aed",
    "#16a34a",
    "#ea580c",
    "#db2777",
    "#dc2626",
  ];

  const quickQuestions =
    userRole === "BUYER"
      ? [
          "How do I contact Admin?",
          "How do I buy a product?",
          "How do I access my purchase?",
          "How do I check my orders?",
          "How do I contact a creator?",
        ]
      : userRole === "CREATOR"
        ? [
            "How do I contact Admin?",
            "How do I create a website listing?",
            "How do I manage my products?",
            "How do I check my orders?",
            "How do I check my earnings?",
          ]
        : [
            "How do I contact Admin?",
            "What is MarketPalce?",
            "How does this website work?",
            "How do I buy a product?",
            "How do I access my purchase?",
          ];

  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [isStreaming, setIsStreaming] =
    useState(false);

  const [adminEmail, setAdminEmail] =
    useState(null);

  const [isLoadingAdminEmail, setIsLoadingAdminEmail] =
    useState(false);

  const [adminEmailError, setAdminEmailError] =
    useState("");

  const [streamingMessageId, setStreamingMessageId] =
    useState(null);

  const [dashboardColor, setDashboardColor] =
    useState(
      auth.user?.dashboardColor ??
        defaultDashboardColor,
    );

  const [isSavingDashboardColor, setIsSavingDashboardColor] =
    useState(false);

  const [dashboardColorMessage, setDashboardColorMessage] =
    useState("");

  const [dashboardColorError, setDashboardColorError] =
    useState("");

  const [messages, setMessages] = useState([
    {
      id: messageId++,
      sender: "assistant",
      text:
        userRole === "BUYER"
          ? "Hi! 👋 I'm your MarketPalce Assistant for Buyers. How can I help you?"
          : userRole === "CREATOR"
            ? "Hi! 👋 I'm your MarketPalce Assistant for Creators. How can I help you?"
            : "Hi! 👋 I'm the MarketPalce Assistant. How can I help you?",
    },
  ]);


  const handleContactAdmin = async () => {
    if (isLoadingAdminEmail) {
      return;
    }

    setIsLoadingAdminEmail(true);
    setAdminEmailError("");

    try {
      const data =
        await apiRequest(
          "/auth/admin-contact",
        );

      setAdminEmail(
        data?.email ?? null,
      );
    } catch (error) {
      setAdminEmailError(
        error?.message ??
          "Admin contact information is currently unavailable.",
      );
    } finally {
      setIsLoadingAdminEmail(false);
    }
  };


  const handleSaveDashboardColor = async () => {
    if (
      !auth.token ||
      userRole === "ADMIN" ||
      isSavingDashboardColor
    ) {
      return;
    }

    setIsSavingDashboardColor(true);
    setDashboardColorMessage("");
    setDashboardColorError("");

    try {
      await updateDashboardColor(
        auth.token,
        dashboardColor,
      );

      setDashboardColorMessage(
        "Dashboard color saved.",
      );
    } catch (error) {
      setDashboardColorError(
        error?.message ??
          "Unable to save dashboard color.",
      );
    } finally {
      setIsSavingDashboardColor(false);
    }
  };


  const handleResetDashboardColor = async () => {
    if (
      !auth.token ||
      userRole === "ADMIN" ||
      isSavingDashboardColor
    ) {
      return;
    }

    const defaultColor =
      defaultDashboardColor;

    setDashboardColor(defaultColor);
    setDashboardColorMessage("");
    setDashboardColorError("");

    setIsSavingDashboardColor(true);

    try {
      await updateDashboardColor(
        auth.token,
        defaultColor,
      );

      setDashboardColorMessage(
        "Dashboard color reset to default.",
      );
    } catch (error) {
      setDashboardColorError(
        error?.message ??
          "Unable to reset dashboard color.",
      );
    } finally {
      setIsSavingDashboardColor(false);
    }
  };


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

            token: auth.token,

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

                  {(userRole === "BUYER" ||
                    userRole === "CREATOR") && (
                    <div className="marketplace-assistant__dashboard-color">
                      <div>
                        <strong>
                          Customize Dashboard
                        </strong>
                      </div>

                      <div className="marketplace-assistant__message-line">
                        Choose your dashboard accent color.
                      </div>

                      <div className="marketplace-assistant__color-options">
                        {dashboardColorOptions.map(
                          (color) => (
                            <button
                              key={color}
                              type="button"
                              className={
                                dashboardColor === color
                                  ? "marketplace-assistant__color-option marketplace-assistant__color-option--selected"
                                  : "marketplace-assistant__color-option"
                              }
                              style={{
                                backgroundColor:
                                  color,
                              }}
                              onClick={() => {
                                setDashboardColor(
                                  color,
                                );
                                setDashboardColorMessage(
                                  "",
                                );
                                setDashboardColorError(
                                  "",
                                );
                              }}
                              aria-label={`Select dashboard color ${color}`}
                              aria-pressed={
                                dashboardColor === color
                              }
                            />
                          ),
                        )}
                      </div>

                      <div className="marketplace-assistant__dashboard-color-actions">
                        <button
                          type="button"
                          onClick={
                            handleSaveDashboardColor
                          }
                          disabled={
                            isSavingDashboardColor
                          }
                        >
                          {isSavingDashboardColor
                            ? "Saving..."
                            : "Save Color"}
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleResetDashboardColor
                          }
                          disabled={
                            isSavingDashboardColor
                          }
                        >
                          Reset to Default
                        </button>
                      </div>

                      {dashboardColorMessage && (
                        <div className="marketplace-assistant__message-line">
                          {dashboardColorMessage}
                        </div>
                      )}

                      {dashboardColorError && (
                        <div className="marketplace-assistant__message-line">
                          {dashboardColorError}
                        </div>
                      )}
                    </div>
                  )}


                  {isLoadingAdminEmail && (
                    <div className="marketplace-assistant__message marketplace-assistant__message--assistant">
                      Getting the MarketPalce Admin contact...
                    </div>
                  )}


                  {adminEmailError && (
                    <div className="marketplace-assistant__message marketplace-assistant__message--assistant">
                      {adminEmailError}
                    </div>
                  )}


                  {adminEmail && (
                    <div className="marketplace-assistant__message marketplace-assistant__message--assistant">
                      <div>
                        <strong>
                          Contact MarketPalce Admin
                        </strong>
                      </div>

                      <div className="marketplace-assistant__message-line">
                        You can contact the MarketPalce Admin by email:
                      </div>

                      <div className="marketplace-assistant__message-line">
                        <strong>{adminEmail}</strong>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              adminEmail,
                            );
                          } catch {
                            // Clipboard access may be unavailable
                          }
                        }}
                      >
                        Copy Email
                      </button>
                    </div>
                  )}


                  {quickQuestions.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => {
                          if (
                            question ===
                            "How do I contact Admin?"
                          ) {
                            handleContactAdmin();
                            return;
                          }

                          sendMessage(question);
                        }}
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
          setIsOpen((previous) => !previous)
        }
        aria-label={
          isOpen
            ? "Close MarketPalce Assistant"
            : "Open MarketPalce Assistant"
        }
      >
        {isOpen ? (
          <span className="marketplace-assistant__close-icon">
            ×
          </span>
        ) : (
          <span
            className="marketplace-assistant__bot"
            aria-hidden="true"
          >
            <span className="marketplace-assistant__bot-antenna">
              <span className="marketplace-assistant__bot-antenna-light" />
            </span>

            <span className="marketplace-assistant__bot-head">
              <span className="marketplace-assistant__bot-ear marketplace-assistant__bot-ear--left" />
              <span className="marketplace-assistant__bot-ear marketplace-assistant__bot-ear--right" />

              <span className="marketplace-assistant__bot-face">
                <span className="marketplace-assistant__bot-eye marketplace-assistant__bot-eye--left" />
                <span className="marketplace-assistant__bot-eye marketplace-assistant__bot-eye--right" />

                <span className="marketplace-assistant__bot-smile" />
              </span>
            </span>

            <span className="marketplace-assistant__bot-neck" />
            <span className="marketplace-assistant__bot-base" />
          </span>
        )}
      </button>
    </>
  );
}