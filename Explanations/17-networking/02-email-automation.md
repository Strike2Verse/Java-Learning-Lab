# Email Automation (JavaMail)

The final subtopic of Networking.

## What JavaMail is

JavaMail (now Jakarta Mail) is a library for sending and receiving
emails programmatically from Java — built on top of email protocols
(SMTP for sending, IMAP/POP3 for receiving), which themselves run over
sockets, tying directly back to the Sockets subtopic.

## Dependency (for reference)

```xml
<dependency>
    <groupId>com.sun.mail</groupId>
    <artifactId>jakarta.mail</artifactId>
    <version>2.0.1</version>
</dependency>
```

## Sending a basic email

```java
import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.Properties;

Properties props = new Properties();
props.put("mail.smtp.host", "smtp.gmail.com");
props.put("mail.smtp.port", "587");
props.put("mail.smtp.auth", "true");
props.put("mail.smtp.starttls.enable", "true");

Session session = Session.getInstance(props, new Authenticator() {
    protected PasswordAuthentication getPasswordAuthentication() {
        return new PasswordAuthentication("your-email@gmail.com", "your-app-password");
    }
});

try {
    Message message = new MimeMessage(session);
    message.setFrom(new InternetAddress("your-email@gmail.com"));
    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("recipient@example.com"));
    message.setSubject("Test Email");
    message.setText("Hello, this is a test email sent from Java!");

    Transport.send(message);
} catch (MessagingException e) {
    System.out.println("Failed to send email: " + e.getMessage());
}
```

**Security note:** never hardcode real credentials in code — exposing
secrets in source code, version history, or even compiled binaries.
Use environment variables or a config file excluded via `.gitignore`.

## Sending HTML content instead of plain text

```java
message.setContent("<h1>Hello!</h1><p>This is <b>HTML</b> content.</p>", "text/html");
```

`setText` treats content as plain text; `setContent(..., "text/html")`
tells the email client to render it as HTML markup.

## Adding an attachment

```java
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMultipart;

MimeBodyPart textPart = new MimeBodyPart();
textPart.setText("Please find the attached file.");

MimeBodyPart attachmentPart = new MimeBodyPart();
attachmentPart.attachFile("report.pdf");

MimeMultipart multipart = new MimeMultipart();
multipart.addBodyPart(textPart);
multipart.addBodyPart(attachmentPart);

message.setContent(multipart);
```

## Sending to multiple recipients

```java
message.setRecipients(Message.RecipientType.TO,
    InternetAddress.parse("person1@example.com,person2@example.com"));
message.setRecipients(Message.RecipientType.CC,
    InternetAddress.parse("manager@example.com"));
```

## Why this is genuinely useful

The exact mechanism behind automated notification systems, password
reset emails, scheduled report delivery, and contact form backends — a
common real-world use case combining networking, exception handling, and
file handling (for attachments) into one practical feature.

SMTP (and IMAP/POP3) define what data to send and how to structure it,
but ultimately transmit that data over a standard TCP socket connection
— the same socket mechanism from the previous subtopic, with a specific
protocol layered on top.

## Reference File

See [`JavaMailExample.java`](../../Code/17-networking/02-email-automation/JavaMailExample.java)
for a reference example covering plain-text email, HTML email, and an
email with an attachment — credentials read from environment variables,
never hardcoded.

**Note:** requires the `jakarta.mail` dependency and real SMTP
credentials to actually compile and run.