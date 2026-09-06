package com.fyooriz.visualstudioacode.platform;

import java.util.EnumSet;
import java.util.Set;

/** Central AI authorization policy; skills/providers cannot grant themselves privileges. */
public final class AIPermissionGate {
    public enum Action {
        READ_FILE,
        SUGGEST_CODE,
        MODIFY_FILE,
        CREATE_FILE,
        DELETE_FILE,
        EXECUTE_SHELL,
        BUILD_TEST,
        GIT_OPERATION,
        REMOTE_PUSH
    }

    private static final Set<Action> ALWAYS_ALLOWED = Set.of(
        Action.READ_FILE,
        Action.SUGGEST_CODE
    );

    private AIPermissionGate() {}

    public static boolean allowedWithoutConfirmation(Action action) {
        return ALWAYS_ALLOWED.contains(action);
    }

    public static boolean allowed(Action action, boolean userApproved, boolean autoRunEnabled) {
        if (allowedWithoutConfirmation(action)) return true;
        if (action == Action.BUILD_TEST && autoRunEnabled) return true;
        return userApproved;
    }

    public static boolean requiresConfirmation(Action action) {
        return !allowedWithoutConfirmation(action) && action != Action.REMOTE_PUSH;
    }

    public static boolean requiresConfirmationAlways(Action action) {
        return action == Action.REMOTE_PUSH;
    }

    public static Set<Action> protectedActions() {
        EnumSet<Action> actions = EnumSet.allOf(Action.class);
        actions.removeAll(ALWAYS_ALLOWED);
        return Set.copyOf(actions);
    }
}
