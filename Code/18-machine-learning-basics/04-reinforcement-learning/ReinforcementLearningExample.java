// Self-contained Q-Learning simulation — runnable with plain javac/java.
// No external ML library (Weka/DL4J) required.
// Uses only java.util.Random from the standard library.

import java.util.Random;

public class ReinforcementLearningExample {

    public static void main(String[] args) {

        // Grid world: 5 states (positions 0-4), goal is state 4
        // Actions: 0 = move left, 1 = move right
        // Reward: +10 for reaching the goal, -1 for any other step

        int numStates = 5;
        int numActions = 2; // 0=left, 1=right
        double[][] qTable = new double[numStates][numActions]; // initialized to 0.0

        double learningRate = 0.1;    // how fast new info overwrites old estimates
        double discountFactor = 0.9;  // how much future rewards are valued
        double epsilon = 0.3;         // exploration rate (30% random, 70% best known)
        int episodes = 500;

        Random random = new Random(42); // fixed seed for reproducible output

        // --- Training loop ---
        for (int episode = 0; episode < episodes; episode++) {
            int state = 0; // agent always starts at position 0

            while (state != 4) { // run until goal state is reached
                int action;

                // Epsilon-greedy: explore randomly or exploit best known action
                if (random.nextDouble() < epsilon) {
                    action = random.nextInt(numActions); // random action (explore)
                } else {
                    // Pick the action with the higher Q-value (exploit)
                    action = qTable[state][0] >= qTable[state][1] ? 0 : 1;
                }

                // Apply action and clamp to valid state range
                int nextState = state + (action == 1 ? 1 : -1);
                nextState = Math.max(0, Math.min(numStates - 1, nextState));

                // Reward: +10 for reaching the goal, -1 for any other transition
                double reward = (nextState == 4) ? 10.0 : -1.0;

                // Best Q-value available from the next state
                double maxFutureQ = Math.max(qTable[nextState][0], qTable[nextState][1]);

                // Q-Learning update formula:
                // Q(s,a) = Q(s,a) + lr * (reward + discount * maxFutureQ - Q(s,a))
                qTable[state][action] += learningRate
                        * (reward + discountFactor * maxFutureQ - qTable[state][action]);

                state = nextState;
            }
        }

        // --- Print the learned Q-table ---
        System.out.println("Learned Q-table after " + episodes + " episodes:");
        System.out.printf("%-10s %-12s %-12s%n", "State", "Left (Q)", "Right (Q)");
        System.out.println("----------------------------------");
        for (int s = 0; s < numStates; s++) {
            System.out.printf("%-10d %-12.4f %-12.4f%n", s, qTable[s][0], qTable[s][1]);
        }

        // --- Show the learned policy ---
        System.out.println();
        System.out.println("Learned policy (best action per state):");
        for (int s = 0; s < numStates - 1; s++) { // state 4 is the goal, no action needed
            String best = qTable[s][1] > qTable[s][0] ? "RIGHT" : "LEFT";
            System.out.println("  State " + s + " -> " + best);
        }
        System.out.println("  State 4 -> GOAL (no action needed)");

        // --- Demonstrate the learned policy from start to goal ---
        System.out.println();
        System.out.println("Agent walking from state 0 to goal using learned policy:");
        int state = 0;
        int steps = 0;
        System.out.print("  Path: " + state);
        while (state != 4 && steps < 20) { // safety limit to avoid infinite loop
            int action = qTable[state][1] > qTable[state][0] ? 1 : 0;
            state = Math.max(0, Math.min(4, state + (action == 1 ? 1 : -1)));
            System.out.print(" -> " + state);
            steps++;
        }
        System.out.println(" [GOAL]");
    }
}
