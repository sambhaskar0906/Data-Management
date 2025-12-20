import Member from "../models/members.model.js";
import { sendWhatsAppMessage } from "../utils/whatsappService.js";

export const sendBulkWhatsAppNotice = async (req, res) => {
    try {
        const { message, memberIds } = req.body;

        if (!message || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message and memberIds are required",
            });
        }

        // ✅ ONLY selected members
        const members = await Member.find({
            _id: { $in: memberIds },
            "personalDetails.phoneNo1": { $exists: true, $ne: "" },
        }).select("personalDetails.phoneNo1 personalDetails.nameOfMember");

        let sent = [];
        let failed = [];

        for (const member of members) {
            try {
                await sendWhatsAppMessage({
                    to: member.personalDetails.phoneNo1,
                    message: `Dear ${member.personalDetails.nameOfMember || "Member"},\n\n${message}`,
                });

                sent.push(member.personalDetails.phoneNo1);
            } catch (err) {
                failed.push({
                    phone: member.personalDetails.phoneNo1,
                    error: err.message,
                });
            }
        }

        return res.json({
            success: true,
            totalMembers: members.length,
            sentCount: sent.length,
            failedCount: failed.length,
            sent,
            failed,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "WhatsApp sending failed",
            error: error.message,
        });
    }
};

