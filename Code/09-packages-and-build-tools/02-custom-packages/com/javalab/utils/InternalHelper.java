package com.javalab.utils;

// No "public" modifier — package-private. Only usable within
// com.javalab.utils, not accessible from outside this package.
class InternalHelper {
    static void logInternal(String msg) {
        System.out.println("[internal] " + msg);
    }
}