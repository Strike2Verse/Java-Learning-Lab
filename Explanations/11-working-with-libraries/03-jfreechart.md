# JFreeChart (data visualization)

The final subtopic of Working with Libraries.

## What JFreeChart is

JFreeChart is a Java library for creating charts — line charts, bar
charts, pie charts, and more — rendered either to a GUI window or saved
as an image file (PNG/JPEG).

## Dependency (for reference)

```xml
<dependency>
    <groupId>org.jfree</groupId>
    <artifactId>jfreechart</artifactId>
    <version>1.5.4</version>
</dependency>
```

## Building a simple bar chart

```java
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.ChartUtils;
import org.jfree.data.category.DefaultCategoryDataset;

import java.io.File;
import java.io.IOException;

public class BarChartExample {
    public static void main(String[] args) throws IOException {

        // Step 1: build the dataset
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        dataset.addValue(50, "Sales", "January");
        dataset.addValue(70, "Sales", "February");
        dataset.addValue(60, "Sales", "March");

        // Step 2: create the chart from the dataset
        JFreeChart barChart = ChartFactory.createBarChart(
            "Monthly Sales", "Month", "Sales", dataset
        );

        // Step 3: save it as an image file
        ChartUtils.saveChartAsPNG(new File("sales_chart.png"), barChart, 800, 600);
    }
}
```

## DefaultCategoryDataset — the data behind the chart

Conceptually a 2D structure mapping (series, category) pairs to values —
similar to a `Map` JFreeChart knows how to read and render:

```java
dataset.addValue(value, seriesName, categoryName);
```

## Other chart types (same overall pattern)

```java
JFreeChart lineChart = ChartFactory.createLineChart("Title", "X", "Y", dataset);
JFreeChart pieChart = ChartFactory.createPieChart("Title", pieDataset); // uses DefaultPieDataset instead
```

## Displaying in a GUI window (instead of saving to file)

```java
import javax.swing.JFrame;
import org.jfree.chart.ChartPanel;

JFrame frame = new JFrame("Sales Chart");
ChartPanel chartPanel = new ChartPanel(barChart);
frame.setContentPane(chartPanel);
frame.pack();
frame.setVisible(true);
```

Two main output paths: an interactive GUI window (`ChartPanel`/`JFrame`),
or a static exported image file (`ChartUtils.saveChartAsPNG`).

## Connecting this back to Streams

Raw data typically needs to be transformed/aggregated before it's
chart-ready — Streams (from Data Structures) are the natural tool for
that step, feeding clean results into the dataset:

```java
Map<String, Long> countsByCategory = items.stream()
    .collect(Collectors.groupingBy(Item::getCategory, Collectors.counting()));

DefaultCategoryDataset dataset = new DefaultCategoryDataset();
countsByCategory.forEach((category, count) -> dataset.addValue(count, "Items", category));
```

## Reference Files

See:
- [`BarChartExample.java`](../../Code/11-working-with-libraries/03-jfreechart/BarChartExample.java) — building a bar chart and saving it as a PNG
- [`ChartWithStreamsExample.java`](../../Code/11-working-with-libraries/03-jfreechart/ChartWithStreamsExample.java) —
  aggregating raw data with Streams, feeding it into a dataset, and
  displaying the chart in a GUI window

These are reference examples to consult once a real project has
JFreeChart configured as a dependency.