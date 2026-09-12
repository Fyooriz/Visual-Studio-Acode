plugins {
    id("org.jetbrains.kotlin.multiplatform")
    id("com.android.library")
    id("app.cash.sqldelight")
}

group = "com.fyooriz.visualstudioacode"
version = "0.1.0-SNAPSHOT"

kotlin {
    androidTarget()
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        commonMain.dependencies {
            implementation("app.cash.sqldelight:runtime:2.0.2")
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
        androidMain.dependencies {
            implementation("app.cash.sqldelight:android-driver:2.0.2")
        }
        iosMain.dependencies {
            implementation("app.cash.sqldelight:native-driver:2.0.2")
        }
    }
}

android {
    namespace = "com.fyooriz.visualstudioacode.shared"
    compileSdk = 35
    defaultConfig {
        minSdk = 31
    }
}

sqldelight {
    databases {
        create("AppDatabase") {
            packageName.set("com.fyooriz.visualstudioacode.shared.data")
            schemaOutputDirectory.set(file("src/commonMain/sqldelight/schemas"))
        }
    }
}
