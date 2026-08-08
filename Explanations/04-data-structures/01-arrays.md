# Arrays (1D, 2D)

An array is a fixed-size container that holds multiple values of the same
type, stored in contiguous memory. Once created, its size cannot change.

## 1D Arrays

Declaring and creating with a fixed size (all slots default to 0 for int
arrays):

```java
int[] numbers = new int[5];
```

Declaring with values directly:

```java
int[] numbers = {10, 20, 30, 40, 50};
```

Accessing elements — index starts at 0:

```java
System.out.println(numbers[0]); // 10 (first element)
System.out.println(numbers[4]); // 50 (last element)
```

Modifying an element:

```java
numbers[2] = 99; // changes 30 to 99
```

Getting the length (a field, not a method — no parentheses):

```java
System.out.println(numbers.length); // 5
```

Looping through an array:

```java
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}
```

Accessing an index outside the array's bounds (e.g. `numbers[10]` on a
5-element array) throws an `ArrayIndexOutOfBoundsException` at runtime.

## 2D Arrays

An array of arrays — a grid of rows and columns.

Declaring and creating with a fixed size:

```java
int[][] grid = new int[3][3]; // 3 rows, 3 columns, all default to 0
```

Declaring with values directly:

```java
int[][] grid = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
```

Accessing an element with `[row][column]`:

```java
System.out.println(grid[1][2]); // 6 — row index 1, column index 2
```

These are indexes, not counts — `grid[1][2]` means "row index 1, column
index 2," not "1 row and 2 columns."

Looping through a 2D array needs a nested loop — the outer loop walks the
rows, the inner loop walks the columns within that row:

```java
for (int row = 0; row < grid.length; row++) {
    for (int col = 0; col < grid[row].length; col++) {
        System.out.print(grid[row][col] + " ");
    }
    System.out.println();
}
```

## Practice Program

See [`Arrays1DAnd2D.java`](../../Code/04-data-structures/01-arrays/Arrays1DAnd2D.java)
for a runnable example covering:
- Creating a 1D array with a default size
- Creating and modifying a 1D array with explicit values
- Creating and accessing a 2D grid
- Looping through a 2D array with a nested loop