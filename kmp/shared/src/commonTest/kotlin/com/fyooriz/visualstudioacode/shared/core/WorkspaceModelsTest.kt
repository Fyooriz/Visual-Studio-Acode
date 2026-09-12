package com.fyooriz.visualstudioacode.shared.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse

class WorkspaceModelsTest {
    @Test
    fun descriptorKeepsWorkspaceIdentity() {
        val descriptor = WorkspaceDescriptor(
            id = "workspace-1",
            name = "demo",
            rootUri = "content://workspace/tree/root",
            providerType = WorkspaceProviderType.LOCAL,
            updatedAtEpochMillis = 42L,
        )

        assertEquals("workspace-1", descriptor.id)
        assertEquals("content://workspace/tree/root", descriptor.rootUri)
        assertFalse(descriptor.providerType == WorkspaceProviderType.REMOTE)
    }
}
