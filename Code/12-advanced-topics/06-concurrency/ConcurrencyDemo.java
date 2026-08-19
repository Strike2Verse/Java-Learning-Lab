import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class ConcurrencyDemo {
    public static void main(String[] args) throws InterruptedException, ExecutionException {

        // ---- ExecutorService: a managed thread pool ----
        System.out.println("-- ExecutorService --");
        ExecutorService executor = Executors.newFixedThreadPool(3); // pool of 3 reusable threads

        executor.submit(() -> {
            System.out.println("Task running on: " + Thread.currentThread().getName());
        });

        executor.execute(() -> System.out.println("Another task submitted via execute()"));

        System.out.println("--------------------");

        // ---- Future: getting a result back from a submitted task ----
        System.out.println("-- Future --");
        Future<Integer> future = executor.submit(() -> {
            return 10 + 20; // task that computes a value
        });

        Integer result = future.get(); // blocks until the task finishes
        System.out.println("Future result: " + result);

        // Always shut down an ExecutorService — it keeps running otherwise.
        executor.shutdown();

        System.out.println("--------------------");

        // ---- CompletableFuture: react to a result without blocking ----
        System.out.println("-- CompletableFuture --");
        CompletableFuture<Integer> asyncFuture = CompletableFuture.supplyAsync(() -> {
            return 10 + 20; // runs asynchronously
        });

        asyncFuture.thenAccept(value -> System.out.println("Async result: " + value));

        // give the async task a moment to complete before the program exits
        Thread.sleep(100);

        System.out.println("--------------------");

        // ---- chaining multiple steps ----
        System.out.println("-- CompletableFuture chaining --");
        CompletableFuture<String> chain = CompletableFuture
            .supplyAsync(() -> 10)              // start: produce a value
            .thenApply(n -> n * 2)              // transform it: 20
            .thenApply(n -> "Result: " + n);    // transform again: "Result: 20"

        System.out.println(chain.get()); // Result: 20
    }
}