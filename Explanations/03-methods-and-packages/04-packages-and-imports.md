# Packages and Imports

A package is a folder-like grouping for related classes — it helps
organize code and avoid naming conflicts. Every Java class technically
belongs to a package; if none is declared, it belongs to the "default
package".

## Declaring a package

The `package` statement must be the very first line in a Java file, before
any imports or class code:

```java
package com.javalab.utils;

public class MathHelper {
    public static int square(int x) {
        return x * x;
    }
}
```

This class must physically sit inside a matching folder structure:
`com/javalab/utils/MathHelper.java`.

## Importing a class from another package

```java
import com.javalab.utils.MathHelper;

public class Main {
    public static void main(String[] args) {
        int result = MathHelper.square(5);
        System.out.println(result);
    }
}
```

## Built-in packages

Java's own library is organized into packages too — this is why imports
like `import java.util.Scanner;` or `import java.util.Arrays;` have shown
up throughout earlier topics. `java.util` is a built-in package containing
utility classes like `Scanner`, `Arrays`, `ArrayList`, and more.

## Wildcard imports

```java
import java.util.*;
```

This imports everything from a package at once. It works, but importing
specific classes (e.g. `import java.util.Scanner;`) is generally
considered better practice, since it makes it clear exactly what the code
depends on.

## java.lang — the package that's always available

Classes like `String`, `System`, `Math`, and `Integer` live in `java.lang`,
which Java automatically imports into every file — that's why
`import java.lang.String;` is never written.

## The default package

Classes with no `package` statement sit in the default package. This is
generally considered bad practice: classes in named packages **cannot**
import classes from the default package at all. This is one of the main
reasons to always declare a package, even in small projects.

## Practice Program

See [`Main.java`](../../Code/03-methods-and-packages/04-packages-and-imports/Main.java)
and [`MathHelper.java`](../../Code/03-methods-and-packages/04-packages-and-imports/com/javalab/utils/MathHelper.java)
for a runnable example covering:
- A custom class declared inside a named package (`com.javalab.utils`)
- A default-package `Main` class importing and using that custom package
- A built-in package import (`java.util.Arrays`) used alongside it

### Compiling and running (package example)

Because this example spans multiple files/folders, compile and run it from
inside `04-packages-and-imports/`:

```bash
cd Code/03-methods-and-packages/04-packages-and-imports
javac Main.java com/javalab/utils/MathHelper.java
java Main
```