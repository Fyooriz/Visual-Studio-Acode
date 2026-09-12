package com.fyooriz.visualstudioacode.shared.data

import app.cash.sqldelight.db.SqlDriver

expect class AppSqlDriverFactory {
    fun create(): SqlDriver
}

fun createAppDatabase(factory: AppSqlDriverFactory): AppDatabase =
    AppDatabase(factory.create())
