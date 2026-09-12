import 'package:flutter_test/flutter_test.dart';
import 'package:visual_studio_acode_presentation/main.dart';

void main() {
  testWidgets('renders the Visual Studio Acode editor shell', (tester) async {
    await tester.pumpWidget(const VisualStudioAcodeApp());

    expect(find.text('Visual Studio Acode'), findsOneWidget);
    expect(find.text('main.dart'), findsOneWidget);
    expect(find.byTooltip('Search'), findsOneWidget);
  });

  testWidgets('switches to problems from mobile navigation', (tester) async {
    await tester.pumpWidget(const VisualStudioAcodeApp());

    await tester.tap(find.text('Problems'));
    await tester.pumpAndSettle();

    expect(find.text('No diagnostics'), findsOneWidget);
  });
}
