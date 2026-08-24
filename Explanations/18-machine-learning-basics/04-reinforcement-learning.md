# Reinforcement Learning (Intro)

The fourth and final subtopic of Machine Learning Basics.

## What reinforcement learning means

Unlike supervised learning (labeled answers provided) or unsupervised
learning (no answers at all), reinforcement learning has an **agent**
that learns by taking actions in an **environment** and receiving
**rewards** or **penalties** in return.

There is no dataset to train on upfront — the agent learns through
trial and error, gradually figuring out which actions lead to the best
cumulative reward over time.

## The core idea: Agent, Environment, Reward

```java
// Conceptual loop — not real code yet:
// 1. Agent observes the current state of the environment
// 2. Agent chooses an action
// 3. Environment responds with a new state and a reward (positive or negative)
// 4. Agent updates its strategy based on the reward received
// 5. Repeat until the agent learns the best policy (strategy)
```

The agent is not told what the correct action is — it discovers it by
exploring and being rewarded for good outcomes.

## A simple analogy

Training a dog: no step-by-step instructions are given. The dog tries
an action, gets a treat (reward) if correct, gets nothing or a
correction (penalty) if wrong, and over time learns what behavior leads
to the best outcome. The dog is the agent, the room is the environment,
the treat is the reward.

## Key concepts

**State** — a snapshot of the current situation the agent is in.

**Action** — what the agent can do from that state.

**Reward** — a score (positive or negative) the environment gives after
an action.

**Policy** — the agent's learned strategy: given a state, which action
to take.

**Q-value** — an estimate of the total future reward expected from
taking a specific action in a specific state, used to guide decisions.

## Q-Learning — the simplest RL algorithm

Q-Learning builds a table (Q-table) that maps every (state, action)
pair to an expected reward. The agent updates this table repeatedly as
it explores, converging toward the best policy.

```java
// Conceptual Q-table update (the learning formula):
// Q(state, action) = Q(state, action)
//     + learningRate * (reward + discountFactor * maxFutureQ - Q(state, action))
//
// learningRate  — how quickly new information overwrites old estimates
// discountFactor — how much future rewards are valued vs immediate ones
// maxFutureQ    — the best Q-value achievable from the next state
```

This formula is applied after every action the agent takes, gradually
refining each estimate until the Q-table reflects a good policy.

## A minimal Java simulation (no ML library needed)

Reinforcement learning can be demonstrated with pure Java using a simple
grid world — no Weka or DL4J required for this intro.

```java
// A grid world: agent starts at position 0, goal is position 4
// Actions: move left (-1) or move right (+1)
// Reward: +10 for reaching the goal, -1 for any other step

double[][] qTable = new double[5][2]; // 5 states, 2 actions (0=left, 1=right)
double learningRate = 0.1;
double discountFactor = 0.9;
double epsilon = 0.3; // exploration rate — how often to try random actions

Random random = new Random();

for (int episode = 0; episode < 500; episode++) {
    int state = 0; // always start at position 0

    while (state != 4) { // run until goal is reached
        int action;
        if (random.nextDouble() < epsilon) {
            action = random.nextInt(2); // explore: pick a random action
        } else {
            action = qTable[state][0] >= qTable[state][1] ? 0 : 1; // exploit: pick best known action
        }

        int nextState = state + (action == 1 ? 1 : -1);
        nextState = Math.max(0, Math.min(4, nextState)); // keep within grid

        double reward = (nextState == 4) ? 10.0 : -1.0;
        double maxFutureQ = Math.max(qTable[nextState][0], qTable[nextState][1]);

        // Q-Learning update
        qTable[state][action] += learningRate * (reward + discountFactor * maxFutureQ - qTable[state][action]);

        state = nextState;
    }
}

System.out.println("Learned Q-table:");
for (int s = 0; s < 5; s++) {
    System.out.printf("State %d -> left: %.2f, right: %.2f%n", s, qTable[s][0], qTable[s][1]);
}
```

After enough episodes, the Q-table will show that moving right is
consistently valued higher — the agent has learned the optimal policy
without ever being told it explicitly.

## Exploration vs exploitation

A core tension in RL: the agent needs to **explore** (try new actions
to discover better rewards) but also **exploit** (use what it already
knows to earn reward). `epsilon` above controls this balance — a higher
epsilon means more random exploration.

## Why RL is harder than supervised or unsupervised learning

- No dataset — the agent generates its own experience by interacting
  with the environment
- Rewards can be **delayed** — an action taken now might only show its
  effect many steps later
- The environment can be non-stationary — it may change as the agent
  learns
- Scaling to complex environments (games, robotics) requires deep neural
  networks instead of a simple Q-table — this is **Deep RL** (e.g.,
  DeepMind's AlphaGo)

## Practical real-world use cases

- **Game playing** — AlphaGo, OpenAI Five — agents learning to play
  games better than any human through self-play
- **Robotics** — training a robot arm to pick up objects without
  pre-programming every motion
- **Recommendation systems** — selecting content to show users based on
  ongoing engagement feedback
- **Resource management** — optimizing data center cooling, traffic
  light timing, or network routing

## Reference Files

See:
- [`ReinforcementLearningExample.java`](../../Code/18-machine-learning-basics/04-reinforcement-learning/ReinforcementLearningExample.java) —
  a self-contained Q-Learning simulation on a 5-state grid world,
  runnable with plain `javac`/`java` (no ML library required)

**Note:** unlike the other ML subtopics, this example requires no
external dependency — it uses only `java.util.Random` from the standard
library.
