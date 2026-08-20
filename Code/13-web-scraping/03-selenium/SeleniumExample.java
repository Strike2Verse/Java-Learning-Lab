// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the selenium-java dependency (and a Chrome/ChromeDriver setup)
// via Maven/Gradle first (see Topic 9: Third-party Dependencies).
//
// Maven dependency:
// <dependency>
//     <groupId>org.seleniumhq.selenium</groupId>
//     <artifactId>selenium-java</artifactId>
//     <version>4.18.1</version>
// </dependency>

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class SeleniumExample {
    public static void main(String[] args) {

        // WebDriver implements AutoCloseable, so try-with-resources works
        // directly here — ties back to the Try-with-resources subtopic.
        try (WebDriver driver = new ChromeDriver()) {

            // ---- setting up a browser session ----
            driver.get("https://example.com");

            // ---- finding elements ----
            WebElement heading = driver.findElement(By.tagName("h1"));
            System.out.println("Heading text: " + heading.getText());

            // ---- interacting with the page (example selectors) ----
            // WebElement searchBox = driver.findElement(By.id("search"));
            // searchBox.sendKeys("Java tutorials"); // type into a field
            //
            // WebElement loginButton = driver.findElement(By.className("login-btn"));
            // loginButton.click(); // click a button/link

            // ---- waiting for dynamic content ----
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            WebElement dynamicElement = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("p"))
            );
            System.out.println("Dynamic element text: " + dynamicElement.getText());

        }
        // driver.quit() is called automatically here via try-with-resources,
        // even if an exception occurred above — no orphaned browser process.
    }
}