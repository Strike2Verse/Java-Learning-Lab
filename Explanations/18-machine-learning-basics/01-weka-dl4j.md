# Working with Weka / DL4J

This topic is marked optional in the roadmap — a general intro to ML
concepts in Java, rather than deep technical mastery (a whole separate
field).

## Why Java for ML at all?

Python dominates ML (scikit-learn, TensorFlow, PyTorch), but Java has
real ML tooling too — useful for integrating ML into an existing Java
application rather than building a dedicated ML pipeline from scratch.

## Weka — beginner-friendly, GUI + API

A classic Java ML library with a simple API, good for learning core
concepts without heavy setup.

**Dependency (for reference):**

```xml
<dependency>
    <groupId>nz.ac.waikato.cms.weka</groupId>
    <artifactId>weka-stable</artifactId>
    <version>3.8.6</version>
</dependency>
```

**Loading data and training a simple classifier:**

```java
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;
import weka.classifiers.trees.J48; // a decision tree algorithm

DataSource source = new DataSource("data.arff"); // Weka's own data format
Instances data = source.getDataSet();
data.setClassIndex(data.numAttributes() - 1); // last column = what we're predicting

J48 tree = new J48();
tree.buildClassifier(data); // this is the "training" step

System.out.println(tree); // prints the learned decision tree
```

`.arff` is Weka's native format — conceptually similar to CSV (File
Handling), plus a header section declaring each attribute's name and
type (numeric, nominal, string, etc.), metadata that plain CSV doesn't
carry. `buildClassifier` trains the model by analyzing the features and
constructing decision splits at each node of the tree.

## DL4J (DeepLearning4J) — for actual neural networks

More powerful, more complex — used for deep learning specifically (image
recognition, NLP, etc.), leveraging GPU-accelerated computation for the
massive parallel processing neural networks require.

**Dependency (for reference):**

```xml
<dependency>
    <groupId>org.deeplearning4j</groupId>
    <artifactId>deeplearning4j-core</artifactId>
    <version>1.0.0-M2.1</version>
</dependency>
```

**Conceptual structure of a neural network in DL4J:**

```java
MultiLayerConfiguration config = new NeuralNetConfiguration.Builder()
    .list()
    .layer(new DenseLayer.Builder().nIn(4).nOut(10).build())     // input layer
    .layer(new OutputLayer.Builder().nIn(10).nOut(3).build())     // output layer
    .build();

MultiLayerNetwork model = new MultiLayerNetwork(config);
model.init();
// model.fit(trainingData); // training step (data setup omitted for brevity)
```

## Weka vs DL4J — when to use which

| | Weka | DL4J |
|---|---|---|
| Complexity | Simple, beginner-friendly | Complex, steep learning curve |
| Best for | Classic ML (decision trees, classifiers) | Deep learning (neural networks) |
| GUI available | Yes | No |

## Reference Files

See:
- [`data.arff`](../../Code/18-machine-learning-basics/01-weka-dl4j/data.arff) —
  sample weather dataset used by the Weka example
- [`WekaExample.java`](../../Code/18-machine-learning-basics/01-weka-dl4j/WekaExample.java) —
  loading `.arff` data and training a `J48` decision tree
- [`DL4JExample.java`](../../Code/18-machine-learning-basics/01-weka-dl4j/DL4JExample.java) —
  conceptual structure of defining and initializing a small neural
  network

**Note:** these require the `weka-stable` and `deeplearning4j-core`
dependencies respectively to actually compile and run — not runnable
with plain `javac`/`java`.