# Creating and Using Custom Packages

A deeper, more practical dive on custom packages, building on Topic 3.

## Recap: declaring a package

```java
package com.javalab.utils;

public class MathHelper {
    public static int square(int x) {
        return x * x;
    }
}
```

The folder structure must match the package name exactly:
`com/javalab/utils/MathHelper.java`.

## Package naming conventions

Real-world convention: reverse the domain name, then add
project-specific segments:

```
com.companyname.projectname.module
```

Example: `com.javalab.utils`, `com.javalab.models`, `com.javalab.services`.
This avoids collisions when different companies/projects both create a
class with the same simple name (e.g. `Utils`).

## Multiple classes in the same package

Every class in the same folder with the same `package` declaration
belongs together automatically — no explicit "add to package" step
needed. Classes in the same package can use each other without an
`import`:

```java
// File: com/javalab/utils/StringHelper.java
package com.javalab.utils;

public class StringHelper {
    public static String repeat(String s, int times) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < times; i++) {
            sb.append(s);
        }
        return sb.toString();
    }
}
```

## Package-private (default) access — a practical use case

No modifier = package-private (accessible only within the same package).
Useful for internal helper classes not meant to be exposed outside the
package:

```java
package com.javalab.utils;

class InternalHelper { // no "public" — only usable within com.javalab.utils
    static void logInternal(String msg) {
        System.out.println("[internal] " + msg);
    }
}
```

## Compiling multi-package projects

```bash
javac -d out $(find . -name "*.java")   # compiles everything, preserving package folder structure into "out"
java -cp out Main                        # runs, using "out" as the classpath
```

This becomes much more relevant once build tools like Maven/Gradle are
used later in this topic — they automate this compilation process
entirely.

## Practice Program

See:
- [`com/javalab/utils/MathHelper.java`](../../Code/09-packages-and-build-tools/02-custom-packages/com/javalab/utils/MathHelper.java) — public class in the custom package
- [`com/javalab/utils/StringHelper.java`](../../Code/09-packages-and-build-tools/02-custom-packages/com/javalab/utils/StringHelper.java) — public class that uses a package-private class without an import
- [`com/javalab/utils/InternalHelper.java`](../../Code/09-packages-and-build-tools/02-custom-packages/com/javalab/utils/InternalHelper.java) — package-private class, not accessible outside `com.javalab.utils`
- [`Main.java`](../../Code/09-packages-and-build-tools/02-custom-packages/Main.java) — default-package class that imports and uses the public classes, but cannot access `InternalHelper`

### Compiling and running

```bash
cd Code/09-packages-and-build-tools/02-custom-packages
javac Main.java com/javalab/utils/MathHelper.java com/javalab/utils/StringHelper.java com/javalab/utils/InternalHelper.java
java Main
```