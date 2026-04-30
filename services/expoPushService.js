import fetch from "node-fetch";

export const sendExpoPushNotification = async ({
  tokens = [],
  title,
  body,
  data = {},
}) => {
  try {
    const validTokens = tokens.filter(Boolean);

    if (!validTokens.length) return;

    const messages = validTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data,
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
  } catch (error) {
    console.error("Expo Push Error:", error.message);
  }
};