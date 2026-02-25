<?php
// Email Queue Processor
// Run this script via cron job to send queued emails
// Example: php send_emails.php (or set up a cron job to run it every 5 minutes)

require_once 'config.php';
require_once 'database.php';
require_once 'utils.php';

global $db;

// Get unsent emails
$emails = $db->fetchAll(
    "SELECT * FROM email_queue WHERE is_sent = 0 ORDER BY created_at ASC LIMIT 50"
);

foreach ($emails as $email) {
    try {
        // Send email using PHP mail() function
        // In production, use PHPMailer or similar library
        
        $headers = [
            'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
            'Reply-To: ' . FROM_EMAIL,
            'X-Mailer: PHP/' . phpversion(),
            'MIME-Version: 1.0',
            'Content-type: text/plain; charset=UTF-8'
        ];
        
        $success = mail(
            $email['recipient_email'],
            $email['subject'],
            $email['body'],
            implode("\r\n", $headers)
        );
        
        if ($success) {
            // Mark as sent
            $db->query(
                "UPDATE email_queue SET is_sent = 1, sent_at = NOW() WHERE id = ?",
                [$email['id']]
            );
            echo "Email sent to {$email['recipient_email']}\n";
        } else {
            echo "Failed to send email to {$email['recipient_email']}\n";
        }
    } catch (Exception $e) {
        error_log("Email sending error: " . $e->getMessage());
        echo "Error sending email to {$email['recipient_email']}: " . $e->getMessage() . "\n";
    }
}

echo "Email processing complete.\n";

