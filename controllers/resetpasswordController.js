const uuid = require('uuid');
const bcrypt = require('bcrypt');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');
const fs = require('fs');
const path = require('path');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
console.log("api key", apiKey);
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const forgotpassword = async (req, res) => {
    try {
        console.log("Entering forgot password");
        const { email } = req.body;
        console.log("email", email);
        const user = await User.findOne({ where: { email } });
        console.log("user", user);

        if (!user) {
            throw new Error('User does not exist');
        }

        const id = uuid.v4();
        console.log("id", id);
        const resetLink = `http://localhost:3000/password/resetpassword/${encodeURIComponent(id)}`;
        console.log("resetlink", resetLink);
        await user.createForgotpassword({ id, active: true });

        const sendSmtpEmail = {
            to: [{ email, name: user.name }],
            subject: 'Password Reset',
            htmlContent: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                </head>
                <body>
                    <p>Click the following link to reset your password:</p>
                    <a href="${resetLink}">${resetLink}</a>
                </body>
                </html>
            `,
            sender: { email: 'deepak19csu076@ncuindia.edu', name: 'Deepak' }, // Specify your sender details here
        };

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('API called successfully. Returned data:', data);

        return res.status(200).json({
            message: 'Reset password email sent successfully',
            resetLink, // Include reset link in the response
            success: true,
        });
    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).json({
            message: error.message || 'Internal server error',
            success: false,
        });
    }
};

const validateResetLink = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Reset Link ID:', id);

        const forgotPasswordEntry = await Forgotpassword.findOne({
            attributes: ['id', 'isActive'], // Explicitly select isActive
            where: { id }
        });
        console.log('Forgot Password Entry:', forgotPasswordEntry);
        if (!forgotPasswordEntry || !forgotPasswordEntry.isActive) {
            console.log('Invalid or expired reset link');
            return res.status(400).json({
                message: 'Invalid or expired reset link',
                success: false,
            });
        }

        // Log the path to the HTML form file
        console.log('Reading HTML form from path:', '../public/resetPassword.html');
        const htmlForm = fs.readFileSync(path.join(__dirname, '../public/resetPassword.html'), 'utf8');

        // Log the rendered form before sending it
        console.log('Rendered HTML form:', htmlForm);

        return res.status(200).send(htmlForm);
    } catch (error) {
        console.error('Internal Server Error:', error);
        console.error(error.stack); // Log the complete error stack
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        console.log("entering reset password");
        console.log('Full request object:', req);
        console.log('Request body:', req.body);
        const { id } = req.params;
        const { password } = req.body;
        console.log('req.body:', req.body);

        if (typeof password !== 'string' || password.trim() === '') {
            return res.status(400).json({
                message: 'Password is required',
                success: false,
            });
        }
        
        const forgotPasswordEntry = await Forgotpassword.findOne({ where: { id, isActive: true } });

        if (!forgotPasswordEntry) {
            return res.status(400).json({
                message: 'Invalid or expired reset link',
                success: false,
            });
        }

        // Generate a salt
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        console.log('Password before hashing:', password);

        if (typeof password !== 'string') {
            return res.status(400).json({
                message: 'Password must be a string',
                success: false,
            });
        }

        console.log('req.body:', req.body);
        console.log('URL parameters:', req.params);

        const hashedPassword = await bcrypt.hash(password, 10);


        // Update the user's password in the database
        const user = await User.findOne({ where: { id: forgotPasswordEntry.userId } });
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                success: false,
            });
        }

        await user.update({ password: hashedPassword });

        // Mark the reset link as inactive
        await forgotPasswordEntry.update({ isActive: false });

        return res.status(200).json({
            message: 'Password reset successfully',
            success: true,
        });
    } catch (error) {
        console.error('Internal Server Error:', error);
        console.error(error.stack); // Log the complete error stack
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

module.exports = {
    forgotpassword,
    validateResetLink,
    resetPassword,
};
