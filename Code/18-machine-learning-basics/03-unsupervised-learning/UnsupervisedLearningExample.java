// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the weka-stable dependency via Maven/Gradle first
// (same as previous ML Basics subtopics).

import weka.clusterers.SimpleKMeans;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;

public class UnsupervisedLearningExample {
    public static void main(String[] args) throws Exception {

        DataSource source = new DataSource("data.arff");
        Instances data = source.getDataSet();
        // Note: no setClassIndex() here — there's no "answer" column,
        // unlike Supervised Learning. The algorithm discovers groupings
        // on its own, without being told what's "correct."

        SimpleKMeans kmeans = new SimpleKMeans();
        kmeans.setNumClusters(3); // find 3 groups
        kmeans.buildClusterer(data);

        System.out.println("-- cluster assignments --");
        for (int i = 0; i < data.numInstances(); i++) {
            int cluster = kmeans.clusterInstance(data.instance(i));
            System.out.println("Instance " + i + " -> Cluster " + cluster);
        }

        System.out.println("--------------------");

        // Cluster centroids show the "average" point in each cluster —
        // useful for interpreting what each cluster represents, since
        // there's no ground-truth label to check against.
        System.out.println("-- cluster centroids --");
        System.out.println(kmeans.getClusterCentroids());
    }
}