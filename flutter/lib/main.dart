import 'package:flutter/material.dart';

void main() {
  runApp(const VisualStudioAcodeApp());
}

class VisualStudioAcodeApp extends StatelessWidget {
  const VisualStudioAcodeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Visual Studio Acode',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4DA3FF),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0B0F14),
      ),
      home: const EditorWorkspaceScreen(),
    );
  }
}

class EditorWorkspaceScreen extends StatefulWidget {
  const EditorWorkspaceScreen({super.key});

  @override
  State<EditorWorkspaceScreen> createState() => _EditorWorkspaceScreenState();
}

class _EditorWorkspaceScreenState extends State<EditorWorkspaceScreen> {
  int _selectedTool = 0;
  final TextEditingController _codeController = TextEditingController(
    text: '''fun main() {
    println("Hello, Visual Studio Acode")
}
''',
  );

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 840;
        final tablet = constraints.maxWidth >= 600;

        final content = wide
            ? Row(
                children: [
                  SizedBox(width: 280, child: _buildExplorer(context)),
                  Expanded(child: _buildEditor(context, tablet)),
                  if (_selectedTool != 0)
                    SizedBox(width: 320, child: _buildToolPanel(context)),
                ],
              )
            : Column(
                children: [
                  Expanded(child: _buildEditor(context, tablet)),
                  if (_selectedTool != 0)
                    SizedBox(height: 220, child: _buildToolPanel(context)),
                ],
              );

        return Scaffold(
          appBar: AppBar(
            titleSpacing: 16,
            title: const Text('Visual Studio Acode'),
            actions: [
              IconButton(
                tooltip: 'Search',
                onPressed: () {},
                icon: const Icon(Icons.search_rounded),
              ),
              IconButton(
                tooltip: 'Command palette',
                onPressed: () {},
                icon: const Icon(Icons.bolt_rounded),
              ),
            ],
          ),
          body: content,
          bottomNavigationBar: wide
              ? null
              : NavigationBar(
                  selectedIndex: _selectedTool,
                  onDestinationSelected: (index) {
                    setState(() => _selectedTool = index);
                  },
                  destinations: const [
                    NavigationDestination(
                      icon: Icon(Icons.code_rounded),
                      label: 'Editor',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.warning_amber_rounded),
                      label: 'Problems',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.terminal_rounded),
                      label: 'Terminal',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.preview_rounded),
                      label: 'Preview',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.source_rounded),
                      label: 'Git',
                    ),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildExplorer(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF11161D),
        border: Border(
          right: BorderSide(color: Theme.of(context).dividerColor),
        ),
      ),
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 12),
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: Text(
              'EXPLORER',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
            ),
          ),
          _fileRow('lib', Icons.folder_rounded, true),
          _fileRow('main.dart', Icons.code_rounded, false, selected: true),
          _fileRow('pubspec.yaml', Icons.description_outlined, false),
          _fileRow('README.md', Icons.article_outlined, false),
        ],
      ),
    );
  }

  Widget _fileRow(String label, IconData icon, bool folder,
      {bool selected = false}) {
    return ListTile(
      dense: true,
      minLeadingWidth: 28,
      selected: selected,
      leading: Icon(icon, size: 18),
      title: Text(label),
      trailing: folder ? const Icon(Icons.chevron_right_rounded, size: 18) : null,
      onTap: () {},
    );
  }

  Widget _buildEditor(BuildContext context, bool tablet) {
    return Column(
      children: [
        SizedBox(
          height: 46,
          child: Row(
            children: [
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFF171D25),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.code_rounded, size: 16),
                    SizedBox(width: 8),
                    Text('main.dart'),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Container(
            margin: EdgeInsets.symmetric(horizontal: tablet ? 12 : 0),
            decoration: BoxDecoration(
              color: const Color(0xFF0B0F14),
              borderRadius: tablet ? BorderRadius.circular(10) : BorderRadius.zero,
            ),
            child: TextField(
              controller: _codeController,
              expands: true,
              maxLines: null,
              minLines: null,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 14,
                height: 1.55,
                color: Color(0xFFF2F5F8),
              ),
              cursorColor: const Color(0xFF72B8FF),
              decoration: const InputDecoration(
                border: InputBorder.none,
                contentPadding: EdgeInsets.fromLTRB(18, 16, 18, 24),
              ),
            ),
          ),
        ),
        if (tablet)
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            child: Row(
              children: [
                _statusChip(Icons.check_circle_outline, 'Saved'),
                const SizedBox(width: 8),
                _statusChip(Icons.memory_rounded, 'LSP ready'),
                const Spacer(),
                FilledButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: const Text('Run'),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _statusChip(IconData icon, String label) {
    return Chip(
      avatar: Icon(icon, size: 15),
      label: Text(label),
    );
  }

  Widget _buildToolPanel(BuildContext context) {
    final title = switch (_selectedTool) {
      1 => 'Problems',
      2 => 'Terminal',
      3 => 'Preview',
      4 => 'Git',
      _ => 'Tool',
    };
    return Container(
      color: const Color(0xFF11161D),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 16),
            Expanded(
              child: Center(
                child: Text(
                  _selectedTool == 1 ? 'No diagnostics' : 'Ready',
                  style: const TextStyle(color: Color(0xFFC7D0DA)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
