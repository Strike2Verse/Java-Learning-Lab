// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the jakarta.mail dependency via Maven/Gradle, plus real SMTP
// credentials (never hardcoded — use environment variables or a
// .gitignore'd config file instead of the placeholder shown below).
//
// Maven dependency:
// <dependency>
//     <groupId>com.sun.mail</groupId>
//     <artifactId>jakarta.mail</artifactId>
//     <version>2.0.1</version>
// </dependency>

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;

import java.util.Properties;

public class JavaMailExample {

    public static void main(String[] args) {
        // Credentials read from environment variables — never hardcoded.
        String fromEmail = System.getenv("EMAIL_USERNAME");
        String appPassword = System.getenv("EMAIL_APP_PASSWORD");

        Session session = buildSession(fromEmail, appPassword);

        sendPlainTextEmail(session, fromEmail, "recipient@example.com");
        sendHtmlEmail(session, fromEmail, "recipient@example.com");
        sendEmailWithAttachment(session, fromEmail, "recipient@example.com");
    }

    static Session buildSession(String fromEmail, String appPassword) {
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        return Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(fromEmail, appPassword);
            }
        });
    }

    // ---- sending a basic plain-text email ----
    static void sendPlainTextEmail(Session session, String from, String to) {
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject("Test Email");
            message.setText("Hello, this is a test email sent from Java!");

            Transport.send(message);
            System.out.println("Plain text email sent successfully!");
        } catch (MessagingException e) {
            System.out.println("Failed to send email: " + e.getMessage());
        }
    }

    // ---- sending HTML content instead of plain text ----
    static void sendHtmlEmail(Session session, String from, String to) {
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject("HTML Test Email");
            message.setContent("<h1>Hello!</h1><p>This is <b>HTML</b> content.</p>", "text/html");

            Transport.send(message);
            System.out.println("HTML email sent successfully!");
        } catch (MessagingException e) {
            System.out.println("Failed to send email: " + e.getMessage());
        }
    }

    // ---- adding an attachment ----
    static void sendEmailWithAttachment(Session session, String from, String to) {
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject("Email With Attachment");

            MimeBodyPart textPart = new MimeBodyPart();
            textPart.setText("Please find the attached file.");

            MimeBodyPart attachmentPart = new MimeBodyPart();
            attachmentPart.attachFile("report.pdf");

            MimeMultipart multipart = new MimeMultipart();
            multipart.addBodyPart(textPart);
            multipart.addBodyPart(attachmentPart);

            message.setContent(multipart);

            Transport.send(message);
            System.out.println("Email with attachment sent successfully!");
        } catch (MessagingException | java.io.IOException e) {
            System.out.println("Failed to send email: " + e.getMessage());
        }
    }
}