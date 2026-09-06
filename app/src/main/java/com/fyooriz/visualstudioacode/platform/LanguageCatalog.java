package com.fyooriz.visualstudioacode.platform;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Language capability catalog assembled from audited Acode/VS Code language sources. */
public final class LanguageCatalog {
    private LanguageCatalog() {}

    private static final Map<String, String> EXTENSIONS = Map.ofEntries(
        Map.entry("js", "JavaScript"), Map.entry("mjs", "JavaScript"), Map.entry("cjs", "JavaScript"),
        Map.entry("jsx", "JavaScript JSX"), Map.entry("ts", "TypeScript"), Map.entry("tsx", "TypeScript TSX"),
        Map.entry("html", "HTML"), Map.entry("htm", "HTML"), Map.entry("css", "CSS"), Map.entry("scss", "SCSS"),
        Map.entry("sass", "Sass"), Map.entry("less", "Less"), Map.entry("json", "JSON"), Map.entry("jsonc", "JSON with Comments"),
        Map.entry("xml", "XML"), Map.entry("svg", "SVG"), Map.entry("md", "Markdown"), Map.entry("markdown", "Markdown"),
        Map.entry("py", "Python"), Map.entry("pyw", "Python"), Map.entry("java", "Java"), Map.entry("kt", "Kotlin"), Map.entry("kts", "Kotlin Script"),
        Map.entry("go", "Go"), Map.entry("rs", "Rust"), Map.entry("php", "PHP"), Map.entry("c", "C"), Map.entry("h", "C/C++"),
        Map.entry("cc", "C++"), Map.entry("cpp", "C++"), Map.entry("cxx", "C++"), Map.entry("hpp", "C++"), Map.entry("cs", "C#"),
        Map.entry("dart", "Dart"), Map.entry("lua", "Lua"), Map.entry("rb", "Ruby"), Map.entry("r", "R"), Map.entry("swift", "Swift"),
        Map.entry("m", "Objective-C"), Map.entry("mm", "Objective-C++"), Map.entry("pl", "Perl"), Map.entry("pm", "Perl"),
        Map.entry("ex", "Elixir"), Map.entry("exs", "Elixir"), Map.entry("hs", "Haskell"), Map.entry("lhs", "Haskell"),
        Map.entry("clj", "Clojure"), Map.entry("cljs", "ClojureScript"), Map.entry("groovy", "Groovy"), Map.entry("gradle", "Gradle"),
        Map.entry("scala", "Scala"), Map.entry("sc", "Scala"), Map.entry("fs", "F#"), Map.entry("fsi", "F# Script"), Map.entry("fsx", "F# Script"),
        Map.entry("vb", "Visual Basic"), Map.entry("vbs", "VBScript"), Map.entry("jl", "Julia"), Map.entry("zig", "Zig"), Map.entry("nim", "Nim"),
        Map.entry("pas", "Pascal"), Map.entry("pp", "Pascal"), Map.entry("f", "Fortran"), Map.entry("for", "Fortran"),
        Map.entry("f77", "Fortran"), Map.entry("f90", "Fortran"), Map.entry("f95", "Fortran"), Map.entry("f03", "Fortran"), Map.entry("f08", "Fortran"),
        Map.entry("asm", "Assembly"), Map.entry("s", "Assembly"), Map.entry("v", "Verilog"), Map.entry("vh", "Verilog"),
        Map.entry("sv", "SystemVerilog"), Map.entry("svh", "SystemVerilog"), Map.entry("vhd", "VHDL"), Map.entry("vhdl", "VHDL"),
        Map.entry("proto", "Protocol Buffers"), Map.entry("cu", "CUDA C++"), Map.entry("cuh", "CUDA C++"), Map.entry("glsl", "GLSL"),
        Map.entry("vert", "GLSL"), Map.entry("frag", "GLSL"), Map.entry("hlsl", "HLSL"), Map.entry("wgsl", "WGSL"), Map.entry("sol", "Solidity"),
        Map.entry("tex", "LaTeX"), Map.entry("sty", "LaTeX"), Map.entry("bib", "BibTeX"), Map.entry("cmake", "CMake"),
        Map.entry("bzl", "Starlark"), Map.entry("star", "Starlark"), Map.entry("sh", "Shell"), Map.entry("bash", "Bash"), Map.entry("zsh", "Zsh"),
        Map.entry("fish", "Fish"), Map.entry("bat", "Batch"), Map.entry("ps1", "PowerShell"), Map.entry("yaml", "YAML"), Map.entry("yml", "YAML"),
        Map.entry("toml", "TOML"), Map.entry("ini", "INI"), Map.entry("conf", "Config"), Map.entry("env", "Env"), Map.entry("tf", "Terraform"),
        Map.entry("hcl", "HCL"), Map.entry("sql", "SQL"), Map.entry("graphql", "GraphQL"), Map.entry("gql", "GraphQL"), Map.entry("smali", "Smali"),
        Map.entry("prisma", "Prisma"), Map.entry("vue", "Vue"), Map.entry("svelte", "Svelte"), Map.entry("dockerfile", "Dockerfile"), Map.entry("makefile", "Makefile")
    );

    public static String fromName(String name) {
        if (name == null || name.isBlank()) return "Plain Text";
        String lower = name.toLowerCase(Locale.ROOT);
        if (lower.equals("dockerfile")) return "Dockerfile";
        if (lower.equals("makefile")) return "Makefile";
        if (lower.equals("cmakelists.txt")) return "CMake";
        if (lower.equals("build") || lower.equals("build.bazel") || lower.equals("workspace")) return "Starlark";
        int dot = lower.lastIndexOf('.');
        if (dot < 0 || dot == lower.length() - 1) return "Plain Text";
        return EXTENSIONS.getOrDefault(lower.substring(dot + 1), "Plain Text");
    }

    public static List<String> supported() {
        return List.of(
            "JavaScript", "JavaScript JSX", "TypeScript", "TypeScript TSX", "HTML", "CSS", "SCSS", "Sass", "Less",
            "JSON", "JSON with Comments", "XML", "SVG", "Markdown", "Python", "Java", "Kotlin", "Kotlin Script", "Go", "Rust", "PHP",
            "C", "C/C++", "C++", "C#", "Dart", "Lua", "Ruby", "R", "Swift", "Objective-C", "Objective-C++", "Perl", "Elixir", "Haskell",
            "Clojure", "ClojureScript", "Groovy", "Gradle", "Scala", "F#", "F# Script", "Visual Basic", "VBScript", "Julia", "Zig", "Nim",
            "Pascal", "Fortran", "Assembly", "Verilog", "SystemVerilog", "VHDL", "Protocol Buffers", "CUDA C++", "GLSL", "HLSL", "WGSL",
            "Solidity", "LaTeX", "BibTeX", "CMake", "Starlark", "Shell", "Bash", "Zsh", "Fish", "Batch", "PowerShell", "YAML", "TOML",
            "INI", "Config", "Env", "Terraform", "HCL", "SQL", "GraphQL", "Smali", "Prisma", "Vue", "Svelte", "Dockerfile", "Makefile", "Plain Text"
        );
    }
}
