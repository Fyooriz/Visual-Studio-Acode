package com.fyooriz.visualstudioacode.platform;

import org.junit.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public final class LanguageCatalogTest {
    @Test
    public void detectsExpandedLanguageFamilies() {
        assertEquals("TypeScript", LanguageCatalog.fromName("app.ts"));
        assertEquals("Scala", LanguageCatalog.fromName("Main.scala"));
        assertEquals("F# Script", LanguageCatalog.fromName("build.fsx"));
        assertEquals("Julia", LanguageCatalog.fromName("data.jl"));
        assertEquals("Zig", LanguageCatalog.fromName("main.zig"));
        assertEquals("Fortran", LanguageCatalog.fromName("solver.f90"));
        assertEquals("SystemVerilog", LanguageCatalog.fromName("cpu.sv"));
        assertEquals("VHDL", LanguageCatalog.fromName("alu.vhd"));
        assertEquals("CUDA C++", LanguageCatalog.fromName("kernel.cu"));
        assertEquals("GLSL", LanguageCatalog.fromName("shader.frag"));
        assertEquals("HLSL", LanguageCatalog.fromName("shader.hlsl"));
        assertEquals("WGSL", LanguageCatalog.fromName("shader.wgsl"));
        assertEquals("Solidity", LanguageCatalog.fromName("contract.sol"));
        assertEquals("Protocol Buffers", LanguageCatalog.fromName("service.proto"));
        assertEquals("CMake", LanguageCatalog.fromName("CMakeLists.txt"));
        assertEquals("Dockerfile", LanguageCatalog.fromName("Dockerfile"));
        assertEquals("Makefile", LanguageCatalog.fromName("Makefile"));
        assertEquals("Plain Text", LanguageCatalog.fromName("README"));
    }

    @Test
    public void supportedListHasNoDuplicatesAndCoversNewFamilies() {
        List<String> supported = LanguageCatalog.supported();
        Set<String> unique = new HashSet<>(supported);
        assertEquals(supported.size(), unique.size());
        assertTrue(supported.contains("Scala"));
        assertTrue(supported.contains("Julia"));
        assertTrue(supported.contains("SystemVerilog"));
        assertTrue(supported.contains("CUDA C++"));
        assertTrue(supported.contains("Solidity"));
        assertTrue(supported.contains("CMake"));
    }
}
