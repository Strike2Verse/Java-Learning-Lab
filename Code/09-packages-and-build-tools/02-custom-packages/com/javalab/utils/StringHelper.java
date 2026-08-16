package com.javalab.utils;

public class StringHelper {
    public static String repeat(String s, int times) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < times; i++) {
            sb.append(s);
        }
        // InternalHelper is in the same package, so no import is needed.
        InternalHelper.logInternal("repeat() called with times=" + times);
        return sb.toString();
    }
}