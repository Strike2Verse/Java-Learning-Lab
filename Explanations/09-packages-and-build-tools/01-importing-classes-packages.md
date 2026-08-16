# Importing Classes/Packages

A deeper dive on importing, building on "Packages and Imports" (Topic 3),
plus setting up for build tools later in this topic.

## Why imports exist

Java organizes classes into packages to avoid naming collisions and keep
related code together. To use a class from a different package, it must
be `import`-ed.

## Types of imports

```java
import java.util.List;        // single class import
import java.util.*;           // wildcard — imports all classes in java.util
import static java.lang.Math.PI; // static import — brings in a static member directly
```

## Single-class vs wildcard imports

```java
import java.util.ArrayList;
import java.util.List;
```

vs.

```java
import java.util.*;
```

Explicit single imports are generally preferred in real projects — they
make it immediately clear which classes are actually used, and avoid
ambiguity if two different packages happen to have a class with the same
name.

## Static imports — importing members, not just classes

Normally:

```java
import java.lang.Math;
double area = Math.PI * radius * radius;
```

With a static import:

```java
import static java.lang.Math.PI;
import static java.lang.Math.sqrt;

double area = PI * radius * radius; // no "Math." prefix needed
double root = sqrt(16);
```

A static import doesn't skip importing the class itself — it skips having
to write the class name as a prefix every time that member is used.
Useful for frequently-used constants/methods, but overusing static
imports can hurt readability — an unprefixed `PI` isn't immediately
obvious in origin without checking the imports.

## Fully qualified names (no import needed, but verbose)

`import` can be skipped entirely by writing the full package path every
time:

```java
java.util.List<String> names = new java.util.ArrayList<>();
```

Rarely used in practice (too verbose), but useful in the rare case of a
genuine naming collision — e.g., needing both `java.util.Date` and
`java.sql.Date` in the same file, since both can't be imported normally
without conflicting:

```java
java.util.Date utilDate = new java.util.Date();
java.sql.Date sqlDate = new java.sql.Date(System.currentTimeMillis());
```

## Import order/organization (convention, not enforced by the compiler)

Most style guides suggest grouping imports: Java standard library first,
then third-party libraries, alphabetically within each group. IDEs often
handle this automatically.

## Practice Program

See [`ImportingClassesPackages.java`](../../Code/09-packages-and-build-tools/01-importing-classes-packages/ImportingClassesPackages.java)
for a runnable example covering:
- Single-class imports (`ArrayList`, `List`)
- Static imports (`PI`, `sqrt`) compared against the non-static form
- Fully qualified names resolving a genuine naming collision
  (`java.util.Date` vs `java.sql.Date`)