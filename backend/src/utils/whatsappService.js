import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const formatWhatsAppNumber = (phone) => {
    if (!phone) return null;

    const cleaned = phone.replace(/\D/g, "");

    return `whatsapp:+${cleaned}`;
};

export const sendWhatsAppMessage = async ({ to, message }) => {
    const formattedTo = formatWhatsAppNumber(to);

    if (!formattedTo) {
        throw new Error("Invalid phone number");
    }

    return client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: formattedTo,
        body: message,
    });
};
