// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the weka-stable dependency via Maven/Gradle first
// (same as WekaExample.java from the previous subtopic).

import weka.classifiers.Evaluation;
import weka.classifiers.trees.J48;
import weka.core.Instance;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;

import java.util.Random;

public class SupervisedLearningExample {
    public static void main(String[] args) throws Exception {

        // ---- loading labeled data (classification: predicting "play" yes/no) ----
        DataSource source = new DataSource("data.arff");
        Instances data = source.getDataSet();
        data.setClassIndex(data.numAttributes() - 1);

        J48 tree = new J48();
        tree.buildClassifier(data); // training on LABELED data

        System.out.println("-- trained model --");
        System.out.println(tree);

        System.out.println("--------------------");

        // ---- predicting on a new, unlabeled instance ----
        // Using the first instance in the dataset as a stand-in "new" example.
        Instance newInstance = data.instance(0);
        double prediction = tree.classifyInstance(newInstance);
        System.out.println("-- prediction --");
        System.out.println("Predicted class: " + data.classAttribute().value((int) prediction));

        System.out.println("--------------------");

        // ---- evaluating the model with 10-fold cross-validation ----
        // Never trust accuracy measured only on the training data — it
        // hides overfitting. Cross-validation gives a more reliable
        // estimate by testing on data the model didn't train on.
        System.out.println("-- evaluation: 10-fold cross-validation --");
        Evaluation eval = new Evaluation(data);
        eval.crossValidateModel(tree, data, 10, new Random(1));

        System.out.println(eval.toSummaryString());
        System.out.println("Accuracy: " + (1 - eval.errorRate()) * 100 + "%");
    }
}