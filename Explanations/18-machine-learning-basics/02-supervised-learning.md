# Supervised Learning

## What supervised learning means

Supervised learning means training a model on labeled data — data where
the correct answer is already known for each example. The model learns
the pattern connecting input features to the known output, then applies
that pattern to predict outputs for new, unseen inputs.

This is exactly what the Weka example from the previous subtopic did:
the weather data had a known `play` (yes/no) outcome for each row —
that's the "label."

## Two main types of supervised learning

**Classification** — predicting a category (like the weather example:
yes/no).

```java
// Example: classifying an email as "spam" or "not spam"
// Example: classifying a tumor as "benign" or "malignant"
```

**Regression** — predicting a continuous number.

```java
// Example: predicting a house's price based on size, location, etc.
// Example: predicting tomorrow's temperature
```

## A simple classification example with Weka

```java
import weka.classifiers.trees.J48;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;

DataSource source = new DataSource("data.arff");
Instances data = source.getDataSet();
data.setClassIndex(data.numAttributes() - 1);

J48 tree = new J48();
tree.buildClassifier(data); // training on LABELED data

double prediction = tree.classifyInstance(newInstance);
System.out.println("Predicted class: " + data.classAttribute().value((int) prediction));
```

## Evaluating a model

A model should never be trusted blindly — it's evaluated, usually by
splitting data into a training set and a test set (the model never sees
the test set during training):

```java
import weka.classifiers.Evaluation;

Evaluation eval = new Evaluation(data);
eval.crossValidateModel(tree, data, 10, new java.util.Random(1)); // 10-fold cross-validation

System.out.println(eval.toSummaryString());
System.out.println("Accuracy: " + (1 - eval.errorRate()) * 100 + "%");
```

**Cross-validation** splits the data into 10 parts, trains on 9 of them,
tests on the remaining 1, repeats this so each part gets a turn as the
test set, then averages the results — giving a more reliable accuracy
estimate than a single train/test split.

## Overfitting

A model that performs great on training data but poorly on new data has
**overfit** — it memorized the training examples instead of learning the
actual underlying pattern. Evaluating only on training data doesn't
cause overfitting, but it hides it: a memorized model scores perfectly on
data it's already seen, giving a falsely inflated sense of accuracy. This
is why the train/test split (and cross-validation) matters — training
accuracy alone is misleading.

## Common supervised learning algorithms (conceptual overview)

- **Decision Trees** (like `J48`) — a series of yes/no questions
- **Linear Regression** — fits a straight line/plane to predict numbers
- **k-Nearest Neighbors (k-NN)** — predicts based on the "closest"
  similar examples
- **Support Vector Machines (SVM)** — finds the best boundary separating
  classes

## Reference Files

See:
- [`data.arff`](../../Code/18-machine-learning-basics/02-supervised-learning/data.arff) —
  the same sample weather dataset used in the previous subtopic
- [`SupervisedLearningExample.java`](../../Code/18-machine-learning-basics/02-supervised-learning/SupervisedLearningExample.java) —
  training a classifier, predicting on a new instance, and evaluating
  with 10-fold cross-validation

**Note:** requires the `weka-stable` dependency to actually compile and
run — not runnable with plain `javac`/`java`.