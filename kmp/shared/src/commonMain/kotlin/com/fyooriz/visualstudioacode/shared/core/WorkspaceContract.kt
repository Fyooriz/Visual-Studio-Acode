package com.fyooriz.visualstudioacode.shared.core

interface WorkspaceContract {
    suspend fun listChildren(parentUri: String): OperationResult<List<WorkspaceEntry>>
    suspend fun readText(uri: String): OperationResult<String>
    suspend fun writeText(uri: String, content: String): OperationResult<Unit>
}

data class WorkspaceEntry(
    val uri: String,
    val name: String,
    val mimeType: String?,
    val isDirectory: Boolean,
)
