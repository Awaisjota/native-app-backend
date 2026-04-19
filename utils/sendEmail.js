import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // ⚠️ use APP PASSWORD here
      },
    });

    const info = await transporter.sendMail({
      from: `"My App 🚀" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,   // fallback text
      html,   // optional HTML email
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    throw new Error("Email not sent");
  }
};