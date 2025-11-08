import BulkMail from '../models/BulkMail.js';
import Member from '../models/members.model.js';
import { sendBulkEmail } from '../utils/emailService.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const createBulkMail = async (req, res) => {
    try {
        const {
            religion,
            festivalName,
            customMessage,
            yourName,
            sendToAll,
            specificReligion
        } = req.body;

        console.log('Received data:', {
            religion,
            festivalName,
            customMessage,
            yourName,
            sendToAll,
            specificReligion
        });

        // Cloudinary upload for photo
        let uploadedPhoto = null;
        if (req.file) {
            console.log('File received:', req.file);
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (!cloudinaryResponse) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload image to Cloudinary'
                });
            }
            uploadedPhoto = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url
            };
            console.log('Cloudinary upload successful:', uploadedPhoto);
        }

        // Find recipients based on filters
        let filter = {
            'personalDetails.emailId': { $exists: true, $ne: '', $ne: null }
        };

        // Logic for filtering based on sendToAll and religion
        if (sendToAll === 'true' || sendToAll === true) {
            console.log('🌍 Sending to ALL members with emails');
            // No religion filter - send to everyone
        } else if (specificReligion && specificReligion !== 'All') {
            filter['personalDetails.religion'] = specificReligion;
            console.log('🔍 Filtering by specific religion:', specificReligion);
        } else if (religion && religion !== 'All') {
            filter['personalDetails.religion'] = religion;
            console.log('🔍 Filtering by religion:', religion);
        } else {
            console.log('🌍 Sending to ALL members with emails (no filter specified)');
        }

        console.log('Final filter:', JSON.stringify(filter, null, 2));

        // Find members with email addresses based on filter
        const members = await Member.find(filter)
            .select('personalDetails.emailId personalDetails.nameOfMember personalDetails.religion');

        console.log(`📧 Found ${members.length} members with email addresses`);

        // Debug: Log all found members
        members.forEach((member, index) => {
            console.log(`Member ${index + 1}:`, {
                name: member.personalDetails.nameOfMember,
                email: member.personalDetails.emailId,
                religion: member.personalDetails.religion
            });
        });

        if (members.length === 0) {
            let errorMessage = 'No members found with email addresses';
            if (specificReligion) {
                errorMessage = `No ${specificReligion} members found with email addresses`;
            } else if (religion && religion !== 'All') {
                errorMessage = `No ${religion} members found with email addresses`;
            }

            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }

        // Prepare recipients array - only include members with valid emails
        const recipients = members
            .filter(member => member.personalDetails.emailId && member.personalDetails.emailId.trim() !== '')
            .map(member => ({
                memberId: member._id,
                email: member.personalDetails.emailId.trim().toLowerCase(),
                name: member.personalDetails.nameOfMember || 'Valued Member',
                religion: member.personalDetails.religion,
                status: 'pending'
            }));

        console.log(`✅ Prepared ${recipients.length} recipients with valid emails`);

        // Debug: Log all recipients
        recipients.forEach((recipient, index) => {
            console.log(`📨 Recipient ${index + 1}:`, {
                name: recipient.name,
                email: recipient.email,
                religion: recipient.religion
            });
        });

        // Determine final religion for the bulk mail record
        let finalReligion = 'All';
        if (sendToAll === 'true' || sendToAll === true) {
            finalReligion = 'All';
        } else if (specificReligion && specificReligion !== 'All') {
            finalReligion = specificReligion;
        } else if (religion && religion !== 'All') {
            finalReligion = religion;
        }

        // Create bulk mail record
        const bulkMail = new BulkMail({
            religion: finalReligion,
            festivalName,
            customMessage,
            yourName,
            uploadedPhoto,
            recipients,
            sendToAll: sendToAll === 'true' || sendToAll === true,
            totalRecipients: recipients.length,
            sentBy: req.user?._id || '65a1b2c3d4e5f67890123456'
        });

        await bulkMail.save();
        console.log('💾 Bulk mail saved with ID:', bulkMail._id);

        // Start sending emails in background
        sendEmailsInBackground(bulkMail._id);

        let successMessage = `Bulk mail created successfully. Started sending to ${recipients.length} recipients.`;
        if (finalReligion !== 'All') {
            successMessage = `Bulk mail created successfully. Started sending to ${recipients.length} ${finalReligion} members.`;
        }

        res.status(201).json({
            success: true,
            message: successMessage,
            data: {
                _id: bulkMail._id,
                festivalName: bulkMail.festivalName,
                religion: bulkMail.religion,
                totalRecipients: bulkMail.totalRecipients,
                status: bulkMail.status,
                uploadedPhoto: bulkMail.uploadedPhoto
            }
        });

    } catch (error) {
        console.error('❌ Error creating bulk mail:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
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