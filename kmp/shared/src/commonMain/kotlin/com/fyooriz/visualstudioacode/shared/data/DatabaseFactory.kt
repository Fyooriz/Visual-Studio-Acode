package com.fyooriz.visualstudioacode.shared.data

import app.cash.sqldelight.db.SqlDriver

/** Platform-owned driver factory. Android/iOS implementations are provided at the native boundary. */
fun interface SqlDriverProvider {
    fun create(): SqlDriver
}
