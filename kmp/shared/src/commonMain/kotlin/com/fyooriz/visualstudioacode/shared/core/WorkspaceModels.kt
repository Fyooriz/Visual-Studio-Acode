package com.fyooriz.visualstudioacode.shared.core

/** Stable shared contract; platform code owns the actual filesystem implementation. */
data class WorkspaceDescriptor(
    val id: String,
    val name: String,
    val rootUri: String,
    val providerType: WorkspaceProviderType,
    val updatedAtEpochMillis: Long,
)

enum class WorkspaceProviderType {
    LOCAL,
    REMOTE,
}

data class EditorSessionState(
    val workspaceId: String,
    val fileUri: String,
    val cursorOffset: Int = 0,
    val selectionStart: Int = 0,
    val selectionEnd: Int = 0,
    val scrollOffset: Int = 0,
    val dirty: Boolean = false,
)

sealed interface OperationResult<out T> {
    data class Success<T>(val value: T) : OperationResult<T>
    data class Failure(val code: String, val message: String) : OperationResult<Nothing>
}
