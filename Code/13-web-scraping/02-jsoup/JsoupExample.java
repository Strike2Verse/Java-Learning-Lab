// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the jsoup dependency to be added via Maven/Gradle first
// (see Topic 9: Third-party Dependencies).
//
// Maven dependency:
// <dependency>
//     <groupId>org.jsoup</groupId>
//     <artifactId>jsoup</artifactId>
//     <version>1.17.2</version>
// </dependency>

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;

public class JsoupExample {
    public static void main(String[] args) throws IOException {

        // ---- parsing HTML from a String ----
        String html = "<html><head><title>Sample</title></head>"
            + "<body><h1>Hello</h1><p class=\"intro\">World</p></body></html>";
        Document doc = Jsoup.parse(html);

        System.out.println("Title: " + doc.title());
        System.out.println("Body text: " + doc.body().text()); // "Hello World"

        System.out.println("--------------------");

        // ---- selecting elements with CSS-style selectors ----
        Elements headings = doc.select("h1");        // all <h1> tags
        Elements introParagraphs = doc.select("p.intro"); // <p> tags with class "intro"
        Element firstHeading = doc.select("h1").first();

        System.out.println("Headings found: " + headings.size());
        System.out.println("Intro paragraphs: " + introParagraphs.text());
        System.out.println("First heading text: " + firstHeading.text());

        System.out.println("--------------------");

        // ---- fetching and parsing a live URL directly ----
        Document liveDoc = Jsoup.connect("https://example.com").get();
        System.out.println("Live page title: " + liveDoc.title());

        System.out.println("--------------------");

        // ---- practical example: scraping links from a page ----
        // "abs:href" resolves relative URLs into full absolute URLs.
        Elements links = liveDoc.select("a[href]"); // only <a> tags that have an href attribute
        for (Element link : links) {
            String text = link.text();
            String absoluteHref = link.attr("abs:href");
            System.out.println(text + " -> " + absoluteHref);
        }
    }
}