import Member from "../models/members.model.js";
import nodemailer from "nodemailer";
import fs from "fs";

export const sendNoticeToMembers = async (req, res) => {
    try {
        let { memberIds, subject, message } = req.body;

        // 🧩 Convert memberIds from string → array
        if (typeof memberIds === "string") {
            try {
                memberIds = JSON.parse(memberIds);
            } catch {
                memberIds = [memberIds];
            }
        }

        if (!Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No members selected",
            });
        }

        // ✅ Fetch members
        const members = await Member.find({ _id: { $in: memberIds } });
        const emailList = members.map((m) => m.personalDetails?.emailId).filter(Boolean);

        if (emailList.length === 0)
            return res.status(404).json({
                success: false,
                message: "No valid emails found",
            });

        // ✅ Setup transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // ✅ Prepare email
        const mailOptions = {
            from: `"Society Notice" <${process.env.SMTP_FROM}>`,
            to: emailList.join(","),
            subject,
            html: `
        <div style="font-family:sans-serif; padding:10px;">
          <h3 style="color:#2c3e50;">${subject}</h3>
          <p>${message}</p>
          <hr/>
          <small>This is an automated notice from the society management system.</small>
        </div>
      `,
            // ✅ Attach file if provided
            attachments: req.file
                ? [
                    {
                        filename: req.file.originalname,
                        path: req.file.path,
                        contentType: req.file.mimetype,
                    },
                ]
                : [],
        };

        // ✅ Send email
        await transporter.sendMail(mailOptions);

        // ✅ Delete temp file after sending
        if (req.file) fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: `Notice sent successfully to ${emailList.length} member(s).`,
        });
    } catch (error) {
        console.error("Error sending notice:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};