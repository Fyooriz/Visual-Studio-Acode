import 'package:flutter/services.dart';

/// Presentation-side contract for the future KMP bridge.
/// Native implementations are responsible for enforcing capability boundaries.
class KmpBridge {
  static const MethodChannel _channel = MethodChannel(
    'com.fyooriz.visualstudioacode/core',
  );

  Future<String> get platformStatus async {
    try {
      final value = await _channel.invokeMethod<String>('platformStatus');
      return value ?? 'unavailable';
    } on PlatformException {
      return 'unavailable';
    } on MissingPluginException {
      return 'unavailable';
    }
  }
}
