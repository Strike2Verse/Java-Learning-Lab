# Selenium for Web Automation (Java bindings)

The final subtopic of Web Scraping.

## What Selenium is, and why it's different from Jsoup

Jsoup parses static HTML — but many modern websites load content
dynamically with JavaScript after the initial page load. Jsoup can't see
that content, since it never executes JavaScript. Selenium solves this by
controlling a real browser (Chrome, Firefox, etc.) — it can click
buttons, fill forms, wait for JavaScript to finish, and see the page
exactly as a human would.

## Dependency (for reference)

```xml
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.18.1</version>
</dependency>
```

## Setting up a browser session

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

WebDriver driver = new ChromeDriver(); // launches an actual Chrome browser window
driver.get("https://example.com");
```

## Finding elements

```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

WebElement heading = driver.findElement(By.tagName("h1"));
System.out.println(heading.getText());

WebElement searchBox = driver.findElement(By.id("search"));
WebElement loginButton = driver.findElement(By.className("login-btn"));
```

## Interacting with the page

```java
searchBox.sendKeys("Java tutorials"); // type into a field
loginButton.click();                    // click a button/link

WebElement input = driver.findElement(By.name("q"));
input.sendKeys("search term");
input.submit(); // submits the containing form
```

## Waiting for dynamic content

Since JavaScript-loaded content takes time to appear, Selenium needs to
wait rather than immediately searching (which would fail if the element
isn't there yet):

```java
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement dynamicElement = wait.until(
    ExpectedConditions.visibilityOfElementLocated(By.id("results"))
);
```

## Always close the browser session

```java
driver.quit(); // closes the browser and cleans up — always do this, even on error
```

Without `quit()`, orphaned browser processes accumulate — especially
problematic if an exception occurs before cleanup. `WebDriver` implements
`AutoCloseable`, so `try (WebDriver driver = new ChromeDriver()) { ... }`
works directly, tying back to the Try-with-resources subtopic from
Advanced Topics.

## Jsoup vs Selenium — when to use which

| | Jsoup | Selenium |
|---|---|---|
| Speed | Fast (no browser overhead) | Slower (runs a real browser) |
| JavaScript | Cannot execute it | Fully executes it |
| Use case | Static HTML, simple scraping | Dynamic sites, forms, logins, clicking |
| Resource use | Lightweight | Heavy (full browser process) |

Rule of thumb: always try Jsoup first — it's much faster and lighter.
Only reach for Selenium when the data genuinely isn't in the initial
HTML (i.e., it's loaded by JavaScript afterward).

## Reference File

See [`SeleniumExample.java`](../../Code/13-web-scraping/03-selenium/SeleniumExample.java)
for a reference example covering browser setup, finding elements,
waiting for dynamic content, and using try-with-resources for automatic
`quit()`. Requires the selenium-java dependency and a Chrome/ChromeDriver
setup to actually compile and run.