import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class HashMapTreeMapDemo {
    public static void main(String[] args) {

        // ---- HashMap: key-value pairs, no guaranteed order ----
        HashMap<String, Integer> ages = new HashMap<>();
        ages.put("Alice", 25);
        ages.put("Bob", 30);
        ages.put("Alice", 26); // overwrites — keys are unique, values can change

        System.out.println("HashMap: " + ages);
        System.out.println("Alice's age: " + ages.get("Alice")); // 26

        System.out.println("Contains key Bob? " + ages.containsKey("Bob"));
        System.out.println("Contains value 30? " + ages.containsValue(30));

        ages.remove("Bob");
        System.out.println("After removing Bob: " + ages);
        System.out.println("Size: " + ages.size());

        System.out.println("--------------------");

        // ---- looping with keySet() ----
        System.out.println("Looping with keySet():");
        for (String name : ages.keySet()) {
            System.out.println(name + " -> " + ages.get(name));
        }

        // ---- looping with entrySet() (more efficient, one lookup) ----
        System.out.println("Looping with entrySet():");
        for (Map.Entry<String, Integer> entry : ages.entrySet()) {
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }

        System.out.println("--------------------");

        // ---- missing key returns null, not an error ----
        System.out.println("get(Charlie): " + ages.get("Charlie")); // null

        // getOrDefault avoids null by providing a fallback value.
        System.out.println("getOrDefault(Charlie, 0): " + ages.getOrDefault("Charlie", 0));

        System.out.println("--------------------");

        // ---- TreeMap: key-value pairs, automatically sorted by key ----
        TreeMap<String, Integer> scores = new TreeMap<>();
        scores.put("Charlie", 80);
        scores.put("Alice", 95);
        scores.put("Bob", 88);

        System.out.println("TreeMap (sorted by key): " + scores);

        // TreeMap-specific methods
        System.out.println("First key: " + scores.firstKey());
        System.out.println("Last key: " + scores.lastKey());
    }
}   