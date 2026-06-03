ALTER TABLE users
ADD COLUMN email_verification_otp VARCHAR(255),
ADD COLUMN email_verification_otp_expires TIMESTAMP WITH TIME ZONE;
