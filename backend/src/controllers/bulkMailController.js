import BulkMail from '../models/BulkMail.js';
import Member from '../models/members.model.js';
import { sendBulkEmail } from '../utils/emailService.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const createBulkMail = async (req, res) => {
    try {
        const { religion, festivalName, customMessage, yourName, sendToAll } = req.body;

        let finalRecipients = [];

        if (sendToAll) {
            const members = await Member.find({ "personalDetails.religion": religion });

            finalRecipients = members
                .map((m) => {
                    const email = m.personalDetails?.emailId1;

                    if (!email || email.trim() === "") return null;

                    return {
                        memberId: m._id,
                        email: email.toLowerCase(),
                        name: m.personalDetails?.nameOfMember || "Valued Member",
                        religion: m.personalDetails?.religion,
                        status: "pending"
                    };
                })
                .filter(Boolean);
        }

        const bulkMail = await BulkMail.create({
            religion,
            festivalName,
            customMessage,
            yourName,
            uploadedPhoto: req.body.uploadedPhoto,
            recipients: finalRecipients,
            sendToAll,
            totalRecipients: finalRecipients.length,
            sentBy: req.user?._id || null
        });

        sendEmailsInBackground(bulkMail._id);

        return res.status(201).json({
            success: true,
            message: "Bulk mail created successfully & email sending started",
            data: bulkMail
        });


        return res.status(201).json({
            success: true,
            message: "Bulk mail created successfully",
            data: bulkMail
        });

    } catch (error) {
        console.error("Bulk Mail Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create bulk mail",
            error: error.message
        });
    }
};


// Background email sending function (same as before)
const sendEmailsInBackground = async (bulkMailId) => {
    try {
        const bulkMail = await BulkMail.findById(bulkMailId);
        if (!bulkMail) {
            console.log('Bulk mail not found:', bulkMailId);
            return;
        }

        bulkMail.status = 'sending';
        await bulkMail.save();
        console.log('Started sending emails for bulk mail:', bulkMailId);

        let sentCount = 0;
        let failedCount = 0;

        // Send emails to each recipient
        for (let i = 0; i < bulkMail.recipients.length; i++) {
            const recipient = bulkMail.recipients[i];

            // Double check email validity
            if (!recipient.email || recipient.email.trim() === '') {
                console.log(`Skipping recipient ${i} - no email address`);
                recipient.status = 'failed';
                recipient.error = 'No email address provided';
                failedCount++;
                continue;
            }

            try {
                await sendBulkEmail({
                    to: recipient.email,
                    name: recipient.name,
                    festivalName: bulkMail.festivalName,
                    customMessage: bulkMail.customMessage,
                    yourName: bulkMail.yourName,
                    photoUrl: bulkMail.uploadedPhoto?.url
                });

                recipient.status = 'sent';
                recipient.sentAt = new Date();
                sentCount++;
                console.log(`✅ Email sent to ${recipient.email} (${sentCount}/${bulkMail.totalRecipients})`);

            } catch (error) {
                recipient.status = 'failed';
                recipient.error = error.message;
                failedCount++;
                console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
            }

            // Update progress every 5 emails
            if ((sentCount + failedCount) % 5 === 0) {
                bulkMail.sentCount = sentCount;
                bulkMail.failedCount = failedCount;
                bulkMail.markModified('recipients');
                await bulkMail.save();
                console.log(`📊 Progress: ${sentCount + failedCount}/${bulkMail.totalRecipients}`);
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Final update
        bulkMail.sentCount = sentCount;
        bulkMail.failedCount = failedCount;
        bulkMail.status = failedCount === bulkMail.totalRecipients ? 'failed' : 'completed';
        bulkMail.completedAt = new Date();

        // Mark recipients as modified and save
        bulkMail.markModified('recipients');
        await bulkMail.save();

        console.log(`🎉 Bulk mail ${bulkMailId} completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    } catch (error) {
        console.error('❌ Error in background email sending:', error);
        await BulkMail.findByIdAndUpdate(bulkMailId, {
            status: 'failed',
            completedAt: new Date()
        });
    }
};

// ... other functions remain same
export const getBulkMailStats = async (req, res) => {
    try {
        const { id } = req.params;

        const bulkMail = await BulkMail.findById(id)
            .populate('sentBy', 'name email')
            .select('festivalName religion totalRecipients sentCount failedCount status scheduledAt completedAt createdAt');

        if (!bulkMail) {
            return res.status(404).json({
                success: false,
                message: 'Bulk mail not found'
            });
        }

        res.json({
            success: true,
            data: bulkMail
        });

    } catch (error) {
        console.error('Error getting bulk mail stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getBulkMailHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, religion } = req.query;

        let filter = {};
        if (religion && religion !== 'All') {
            filter.religion = religion;
        }

        const bulkMails = await BulkMail.find(filter)
            .populate('sentBy', 'name email')
            .select('festivalName religion totalRecipients sentCount failedCount status scheduledAt completedAt createdAt uploadedPhoto')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BulkMail.countDocuments(filter);

        res.json({
            success: true,
            data: bulkMails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });

    } catch (error) {
        console.error('Error getting bulk mail history:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getBulkMailById = async (req, res) => {
    try {
        const { bulkMailId } = req.params;

        const bulkMail = await BulkMail.findById(bulkMailId)
            .populate('sentBy', 'name email')
            .populate('recipients.memberId', 'personalDetails.nameOfMember personalDetails.membershipNumber');

        if (!bulkMail) {
            return res.status(404).json({
                success: false,
                message: 'Bulk mail not found'
            });
        }

        res.json({
            success: true,
            data: bulkMail
        });

    } catch (error) {
        console.error('Error getting bulk mail:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};