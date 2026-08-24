// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the weka-stable dependency via Maven/Gradle first.
//
// Maven dependency:
// <dependency>
//     <groupId>nz.ac.waikato.cms.weka</groupId>
//     <artifactId>weka-stable</artifactId>
//     <version>3.8.6</version>
// </dependency>

import weka.classifiers.trees.J48; // a decision tree algorithm
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;

public class WekaExample {
    public static void main(String[] args) throws Exception {

        // .arff is Weka's native format — conceptually similar to CSV
        // (File Handling), just with extra metadata describing each
        // column's type. See data.arff in this same folder.
        DataSource source = new DataSource("data.arff");
        Instances data = source.getDataSet();
        data.setClassIndex(data.numAttributes() - 1); // last column = what we're predicting ("play")

        J48 tree = new J48();
        tree.buildClassifier(data); // trains the decision tree

        System.out.println("Learned decision tree:");
        System.out.println(tree);

        // classifying a new, unseen instance would use tree.classifyInstance(newInstance)
    }
}