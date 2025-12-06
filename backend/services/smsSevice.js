import twilio from 'twilio';

async function sendSMS(message, to) {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,     
      process.env.TWILIO_AUTH_TOKEN     
    );
    const smsResponse = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,     
      to: to       
    });
    console.log("Message sent: ", smsResponse.sid);
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
}
export default sendSMS;
