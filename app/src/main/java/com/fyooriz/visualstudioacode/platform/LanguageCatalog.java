package com.fyooriz.visualstudioacode.platform;

import java.util.List;
import java.util.Map;

/** Language capability catalog assembled from the audited Acode language plugins. */
public final class LanguageCatalog {
    private LanguageCatalog() {}

    private static final Map<String, String> EXTENSIONS = Map.ofEntries(
        Map.entry("js", "JavaScript"), Map.entry("mjs", "JavaScript"), Map.entry("cjs", "JavaScript"),
        Map.entry("ts", "TypeScript"), Map.entry("tsx", "TypeScript"),
        Map.entry("html", "HTML"), Map.entry("htm", "HTML"), Map.entry("css", "CSS"),
        Map.entry("json", "JSON"), Map.entry("md", "Markdown"),
        Map.entry("py", "Python"), Map.entry("java", "Java"), Map.entry("kt", "Kotlin"),
        Map.entry("go", "Go"), Map.entry("rs", "Rust"), Map.entry("php", "PHP"),
        Map.entry("c", "C"), Map.entry("h", "C/C++"), Map.entry("cc", "C++"), Map.entry("cpp", "C++"),
        Map.entry("cs", "C#"), Map.entry("dart", "Dart"), Map.entry("lua", "Lua"),
        Map.entry("yaml", "YAML"), Map.entry("yml", "YAML"), Map.entry("tf", "Terraform"),
        Map.entry("sql", "SQL"), Map.entry("smali", "Smali"), Map.entry("dockerfile", "Dockerfile"),
        Map.entry("prisma", "Prisma")
    );

    public static String fromName(String name) {
        if (name == null || name.isBlank()) return "Plain Text";
        String lower = name.toLowerCase();
        if (lower.equals("dockerfile")) return "Dockerfile";
        int dot = lower.lastIndexOf('.');
        if (dot < 0 || dot == lower.length() - 1) return "Plain Text";
        return EXTENSIONS.getOrDefault(lower.substring(dot + 1), "Plain Text");
    }

    public static List<String> supported() {
        return List.of(
            "JavaScript", "TypeScript", "HTML", "CSS", "JSON", "Markdown", "Python", "Java", "Kotlin",
            "Go", "Rust", "PHP", "C", "C++", "C#", "Dart", "Lua", "YAML", "Terraform", "SQL",
            "Smali", "Dockerfile", "Prisma", "Plain Text"
        );
    }
}
