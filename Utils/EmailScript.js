const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});




async function sendVerificationLink(userEmail, link) {
  try {
    const info = await transporter.sendMail({
      from: `Flutter <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Verify Your Account",
      text: `This Link is Valid for Only 2 minutes. Click on the link to Verify your Account: ${process.env.BACKEND_URL}/api/auth/verify/${link}`,
    });

  } catch (error) {
    console.error("Error sending email:", error.message);
  }
}


module.exports = {sendVerificationLink}
