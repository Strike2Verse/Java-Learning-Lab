// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the deeplearning4j-core dependency via Maven/Gradle first.
// Training data setup is intentionally omitted for brevity — this shows
// the conceptual structure of defining and initializing a network.
//
// Maven dependency:
// <dependency>
//     <groupId>org.deeplearning4j</groupId>
//     <artifactId>deeplearning4j-core</artifactId>
//     <version>1.0.0-M2.1</version>
// </dependency>

import org.deeplearning4j.nn.conf.MultiLayerConfiguration;
import org.deeplearning4j.nn.conf.NeuralNetConfiguration;
import org.deeplearning4j.nn.conf.layers.DenseLayer;
import org.deeplearning4j.nn.conf.layers.OutputLayer;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;

public class DL4JExample {
    public static void main(String[] args) {

        // Conceptual structure of a small neural network:
        // input layer (4 features in) -> hidden layer (10 nodes) ->
        // output layer (3 possible classes out)
        MultiLayerConfiguration config = new NeuralNetConfiguration.Builder()
            .list()
            .layer(new DenseLayer.Builder().nIn(4).nOut(10).build())   // input layer
            .layer(new OutputLayer.Builder().nIn(10).nOut(3).build())  // output layer
            .build();

        MultiLayerNetwork model = new MultiLayerNetwork(config);
        model.init();

        System.out.println("Model initialized: " + model.summary());

        // Training a real model would look like:
        // model.fit(trainingData); // requires a properly prepared DataSetIterator
    }
}