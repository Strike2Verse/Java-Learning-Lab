// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the jfreechart dependency to be added via Maven/Gradle first
// (see Topic 9: Third-party Dependencies).
//
// Maven dependency:
// <dependency>
//     <groupId>org.jfree</groupId>
//     <artifactId>jfreechart</artifactId>
//     <version>1.5.4</version>
// </dependency>

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.JFreeChart;
import org.jfree.data.category.DefaultCategoryDataset;

import java.io.File;
import java.io.IOException;

public class BarChartExample {
    public static void main(String[] args) throws IOException {

        // Step 1: build the dataset — a structured collection JFreeChart
        // knows how to read, conceptually similar to a Map of
        // (series, category) -> value.
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        dataset.addValue(50, "Sales", "January");
        dataset.addValue(70, "Sales", "February");
        dataset.addValue(60, "Sales", "March");

        // Step 2: create the chart from the dataset
        JFreeChart barChart = ChartFactory.createBarChart(
            "Monthly Sales",  // chart title
            "Month",          // x-axis label
            "Sales",          // y-axis label
            dataset
        );

        // Step 3: save it as an image file
        ChartUtils.saveChartAsPNG(new File("sales_chart.png"), barChart, 800, 600);
        System.out.println("Chart saved as sales_chart.png");
    }
}