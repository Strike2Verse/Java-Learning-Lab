// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the jfreechart dependency (see BarChartExample.java for the
// Maven/Gradle setup).

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.data.category.DefaultCategoryDataset;

import javax.swing.JFrame;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ChartWithStreamsExample {

    // A minimal record standing in for "real" data you'd chart.
    record Item(String category, String name) {}

    public static void main(String[] args) {

        List<Item> items = List.of(
            new Item("Fruit", "Apple"),
            new Item("Fruit", "Banana"),
            new Item("Vegetable", "Carrot"),
            new Item("Fruit", "Cherry"),
            new Item("Vegetable", "Potato")
        );

        // ---- using Streams to aggregate raw data into chart-ready metrics ----
        Map<String, Long> countsByCategory = items.stream()
            .collect(Collectors.groupingBy(Item::category, Collectors.counting()));

        // ---- feeding the aggregated results into a chart dataset ----
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        countsByCategory.forEach((category, count) -> dataset.addValue(count, "Items", category));

        JFreeChart barChart = ChartFactory.createBarChart(
            "Item Counts by Category",
            "Category",
            "Count",
            dataset
        );

        // ---- displaying in a GUI window instead of saving to a file ----
        JFrame frame = new JFrame("Item Counts");
        ChartPanel chartPanel = new ChartPanel(barChart);
        frame.setContentPane(chartPanel);
        frame.pack();
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setVisible(true);
    }
}