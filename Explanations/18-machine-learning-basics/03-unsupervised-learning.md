# Unsupervised Learning

The third subtopic of Machine Learning Basics.

## What unsupervised learning means

Unlike supervised learning, there's no labeled answer here — raw data is
given to the model and it finds patterns or structure on its own,
without being told what the "correct" grouping or output should be.

## The main type: Clustering

Clustering groups similar data points together, without any predefined
categories.

```java
// Example: grouping customers by purchasing behavior (without knowing categories in advance)
// Example: grouping news articles by topic similarity
```

## K-Means clustering with Weka

`K` refers to the number of clusters the algorithm should find.

```java
import weka.clusterers.SimpleKMeans;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;

DataSource source = new DataSource("data.arff");
Instances data = source.getDataSet();
// Note: no setClassIndex() here — there's no "answer" column, unlike supervised learning

SimpleKMeans kmeans = new SimpleKMeans();
kmeans.setNumClusters(3); // find 3 groups
kmeans.buildClusterer(data);

for (int i = 0; i < data.numInstances(); i++) {
    int cluster = kmeans.clusterInstance(data.instance(i));
    System.out.println("Instance " + i + " -> Cluster " + cluster);
}
```

No `setClassIndex()` — the key structural difference from Supervised
Learning's code. `setClassIndex()` designates which column is the
"answer" to predict; since unsupervised learning has no such column,
there's nothing to designate.

## How the algorithm decides the clusters (conceptually)

K-Means repeatedly (1) assigns each point to its nearest cluster center,
(2) recalculates each cluster's center based on its assigned points, and
(3) repeats until the centers stop moving significantly — an iterative
process, not a single calculation.

## Why unsupervised learning is harder to evaluate

Supervised learning allows checking predictions against known correct
answers (accuracy, cross-validation). Unsupervised learning has no
ground truth to compare against — cluster quality can only be judged by
indirect measures (e.g., how tightly packed each cluster is), not
correctness.

## Practical real-world use cases

- **Customer segmentation** — grouping customers by behavior for
  targeted marketing
- **Anomaly detection** — finding data points that don't fit any
  cluster (potential fraud, defects)
- **Recommendation systems** (partial use) — grouping similar
  items/users together

## Reference Files

See:
- [`data.arff`](../../Code/18-machine-learning-basics/03-unsupervised-learning/data.arff) —
  the same sample weather dataset reused from earlier subtopics
- [`UnsupervisedLearningExample.java`](../../Code/18-machine-learning-basics/03-unsupervised-learning/UnsupervisedLearningExample.java) —
  running K-Means clustering and printing cluster assignments and
  centroids

**Note:** requires the `weka-stable` dependency to actually compile and
run — not runnable with plain `javac`/`java`.