import nodemailer from 'nodemailer';

// Configure nodemailer with your credentials
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ SMTP Configuration Error:', error);
    } else {
        console.log('✅ SMTP Server is ready to take our messages');
    }
});

export const sendBulkEmail = async ({ to, name, festivalName, customMessage, yourName, photoUrl }) => {
    try {
        const emailTemplate = createEmailTemplate({ name, festivalName, customMessage, yourName, photoUrl });

        const mailOptions = {
            from: `"${yourName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: to,
            subject: `🎉 Happy ${festivalName} Greetings! 🎉`,
            html: emailTemplate,
            text: generatePlainText({ name, festivalName, customMessage, yourName })
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${result.messageId}`);
        return result;

    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error.message);
        throw error;
    }
};

const createEmailTemplate = ({ name, festivalName, customMessage, yourName, photoUrl }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${festivalName} Greetings</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .header {
            background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="confetti" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.3)"/></pattern></defs><rect width="100" height="100" fill="url(%23confetti)"/></svg>');
            opacity: 0.3;
        }
        
        .festival-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
        }
        
        .festival-subtitle {
            font-size: 1.2rem;
            color: #34495e;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .greeting {
            font-size: 1.8rem;
            color: #2c3e50;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .member-name {
            color: #e74c3c;
            font-weight: 700;
        }
        
        .festival-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 15px;
            margin: 25px 0;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            border: 5px solid #f8f9fa;
        }
        
        .message-container {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            padding: 30px;
            border-radius: 15px;
            margin: 25px 0;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .message-container::before {
            content: '"';
            position: absolute;
            top: 10px;
            left: 20px;
            font-size: 4rem;
            color: rgba(255,255,255,0.2);
            font-family: serif;
        }
        
        .custom-message {
            font-size: 1.1rem;
            line-height: 1.8;
            font-style: italic;
            position: relative;
            z-index: 1;
            text-align: center;
        }
        
        .wishes-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            margin: 25px 0;
            border-left: 5px solid #27ae60;
        }
        
        .wishes-text {
            font-size: 1.1rem;
            color: #2c3e50;
            font-weight: 500;
        }
        
        .signature-section {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #ecf0f1;
        }
        
        .signature-name {
            font-size: 1.3rem;
            color: #2c3e50;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .signature-title {
            color: #7f8c8d;
            font-size: 1rem;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 25px 30px;
            text-align: center;
        }
        
        .footer-text {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 10px;
        }
        
        .social-icons {
            margin-top: 15px;
        }
        
        .social-icon {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            line-height: 40px;
            text-align: center;
            margin: 0 5px;
            color: white;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        .social-icon:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }
        
        @media (max-width: 600px) {
            .festival-title {
                font-size: 2rem;
            }
            
            .greeting {
                font-size: 1.5rem;
            }
            
            .content {
                padding: 25px 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header Section -->
        <div class="header">
            <h1 class="festival-title">${festivalName}</h1>
            <p class="festival-subtitle">Festival Greetings & Best Wishes</p>
        </div>
        
        <!-- Content Section -->
        <div class="content">
            <!-- Greeting -->
            <div class="greeting-section">
                <h2 class="greeting">Dear <span class="member-name">${name}</span>,</h2>
            </div>
            
            <!-- Festival Image -->
            ${photoUrl ? `<img src="${photoUrl}" alt="${festivalName}" class="festival-image">` : ''}
            
            <!-- Custom Message -->
            <div class="message-container">
                <p class="custom-message">${customMessage}</p>
            </div>
            
            <!-- Wishes Section -->
            <div class="wishes-section">
                <p class="wishes-text">
                    May this ${festivalName} fill your life with happiness, prosperity, and success. 
                    Wishing you and your loved ones a wonderful celebration filled with joy and memorable moments!
                </p>
            </div>
            
            <!-- Signature -->
            <div class="signature-section">
                <p class="signature-name">${yourName}</p>
                <p class="signature-title">Society Management Team</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                This email was sent automatically from our Member Management System.
            </p>
            <p class="footer-text">
                &copy; ${new Date().getFullYear()} All Rights Reserved.
            </p>
            <div class="social-icons">
                <a href="#" class="social-icon">F</a>
                <a href="#" class="social-icon">T</a>
                <a href="#" class="social-icon">I</a>
                <a href="#" class="social-icon">L</a>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

const generatePlainText = ({ name, festivalName, customMessage, yourName }) => {
    return `
Dear ${name},

${customMessage}

May this ${festivalName} fill your life with happiness, prosperity, and success. 
Wishing you and your loved ones a wonderful celebration filled with joy and memorable moments!

With warm regards,
${yourName}
Society Management Team

This email was sent automatically from our Member Management System.
© ${new Date().getFullYear()} All Rights Reserved.
    `.trim();
};