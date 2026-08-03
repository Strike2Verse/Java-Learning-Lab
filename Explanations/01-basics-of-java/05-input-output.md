# Input and Output

## Output with `System.out`

Use `System.out.println()` to display a value and then move to the next line.

```java
System.out.println("Hello");
```

Use `System.out.print()` when you want the next output to stay on the same line.

```java
System.out.print("Enter text: ");
```

## Input with `Scanner`

`Scanner` reads values entered through the keyboard. Import it, create it with `System.in`, then use a suitable reading method.

```java
import java.util.Scanner;

Scanner input = new Scanner(System.in);
System.out.print("Enter your age: ");
int age = input.nextInt();
input.close();
```

`System.in` represents standard input—normally the keyboard.

## Common `Scanner` methods

- `nextLine()` reads a full line of text.
- `nextInt()` reads a whole number.
- `nextDouble()` reads a decimal number.
- `nextBoolean()` reads `true` or `false`.

## Important detail

After `nextInt()`, pressing Enter leaves a line break waiting to be read. If you next call `nextLine()`, first call an extra `nextLine()` to consume that line break.

## Recap

Use `System.out` for output and `Scanner` with `System.in` for keyboard input. Close the scanner when your program no longer needs it.
