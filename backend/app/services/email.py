import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

async def send_email(to: str, subject: str, text: str, html: str = None, from_email: str = None):
    """
    Send an email using SMTP if credentials are provided.
    Otherwise, logs to console.
    
    Args:
        to: Recipient email
        subject: Email subject
        text: Plain text body
        html: HTML body (optional)
        from_email: Sender email (optional, defaults to SMTP_USER)
    """
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    sender = from_email if from_email else smtp_user

    if smtp_server and smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = sender
            msg["To"] = to

            part1 = MIMEText(text, "plain")
            msg.attach(part1)

            if html:
                part2 = MIMEText(html, "html")
                msg.attach(part2)

            # Connect to server
            server = smtplib.SMTP(smtp_server, int(smtp_port or 587))
            server.starttls()
            server.login(smtp_user, smtp_password) # Always login with main creds
            server.sendmail(sender, to, msg.as_string()) # Send as 'sender'
            server.quit()
            
            print(f"✅ Email sent to {to} from {sender}")
            return True
        except Exception as e:
            print(f"❌ Failed to send email via SMTP: {e}")
            # Fallback to logging
    
    # Log to console if SMTP not configured or failed
    print("="*60)
    print(f"📧 [MOCK] SENDING EMAIL TO: {to}")
    print(f"From: {sender}")
    print(f"Subject: {subject}")
    print("-" * 20)
    print(f"Body (Text): {text}")
    if html:
        print(f"Body (HTML): {html[:100]}...") 
    print("="*60)
    
    return True
