# Jsoup (HTML parsing)

Jsoup is a library for parsing and navigating HTML — it turns raw HTML
text (like what `HttpClient` fetches) into a structured, queryable
document, similar to how a browser's DOM works.

## Dependency (for reference)

```xml
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.17.2</version>
</dependency>
```

## Parsing HTML from a String

```java
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

String html = "<html><body><h1>Hello</h1><p>World</p></body></html>";
Document doc = Jsoup.parse(html);

System.out.println(doc.title());
System.out.println(doc.body().text()); // "Hello World"
```

## Fetching and parsing a live URL directly

```java
Document doc = Jsoup.connect("https://example.com").get();
System.out.println(doc.title());
```

Jsoup handles the fetch and the parse in one step, replacing the need for
`HttpClient` + manual parsing for simple cases. `HttpClient` is still
useful when more control is needed — custom headers, async, POST
requests, etc.

## Selecting elements with CSS-style selectors

Same selector syntax as CSS/jQuery:

```java
Elements headings = doc.select("h1");        // all <h1> tags
Elements links = doc.select("a");             // all <a> tags
Elements paragraphs = doc.select("p.intro");  // <p> tags with class "intro"
Element firstLink = doc.select("a").first();  // just the first match
```

## Extracting data from elements

```java
for (Element link : doc.select("a")) {
    String text = link.text();          // visible text
    String href = link.attr("href");     // attribute value
    System.out.println(text + " -> " + href);
}
```

## Practical example: scraping links from a page

```java
Document doc = Jsoup.connect("https://example.com").get();
Elements links = doc.select("a[href]"); // only <a> tags that have an href attribute

for (Element link : links) {
    System.out.println(link.text() + ": " + link.attr("abs:href")); // "abs:" gives the full absolute URL
}
```

`abs:href` resolves a possibly-relative `href` (e.g. `/about`) into a
full, usable absolute URL (e.g. `https://example.com/about`) —
important since a raw relative link is only meaningful in the context of
the page it came from.

## Being a responsible scraper

Real scraping should respect `robots.txt`, add reasonable delays between
requests, and set a proper `User-Agent` — hammering a site with rapid
requests can get an IP blocked, or cause real harm to smaller sites.

## Reference File

See [`JsoupExample.java`](../../Code/13-web-scraping/02-jsoup/JsoupExample.java)
for a reference example covering parsing from a String, CSS selectors,
fetching a live URL, and extracting absolute links. Requires the jsoup
dependency to actually compile and run.