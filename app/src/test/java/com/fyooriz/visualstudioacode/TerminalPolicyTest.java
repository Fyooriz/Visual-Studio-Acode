package com.fyooriz.visualstudioacode;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public final class TerminalPolicyTest {
    @Test
    public void allowsSafeCommandAndRelativePath() {
        TerminalPolicy.Result result = TerminalPolicy.validate("cat notes.txt");
        assertTrue(result.allowed);
    }

    @Test
    public void rejectsEmptyCommand() {
        assertFalse(TerminalPolicy.validate(" ").allowed);
    }

    @Test
    public void rejectsUnknownCommand() {
        assertFalse(TerminalPolicy.validate("sh -c echo").allowed);
    }

    @Test
    public void rejectsShellOperators() {
        assertFalse(TerminalPolicy.validate("ls && cat notes.txt").allowed);
        assertFalse(TerminalPolicy.validate("echo hi | cat").allowed);
        assertFalse(TerminalPolicy.validate("echo $(pwd)").allowed);
    }

    @Test
    public void rejectsUnsafePaths() {
        assertFalse(TerminalPolicy.validate("cat ../secret.txt").allowed);
        assertFalse(TerminalPolicy.validate("cat /sdcard/secret.txt").allowed);
        assertFalse(TerminalPolicy.validate("cat ~/secret.txt").allowed);
    }

    @Test
    public void rejectsQuotedShellExpressions() {
        assertFalse(TerminalPolicy.validate("echo 'hello'").allowed);
        assertFalse(TerminalPolicy.validate("echo \"hello\"").allowed);
    }
}
