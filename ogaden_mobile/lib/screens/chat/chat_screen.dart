import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ogaden_mobile/constants/app_theme.dart';
import 'package:ogaden_mobile/models/chat_model.dart';
import 'package:ogaden_mobile/services/chat_service.dart';
import 'package:intl/intl.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final ChatService _chatService = ChatService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Conversation? _conversation;

  @override
  void initState() {
    super.initState();
    _initConversation();
  }

  Future<void> _initConversation() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final conversation = await _chatService.getOrCreateConversation(user.uid, user.displayName ?? 'Customer');
      setState(() => _conversation = conversation);
    }
  }

  void _sendMessage() async {
    final user = FirebaseAuth.instance.currentUser;
    if (_messageController.text.trim().isEmpty || user == null || _conversation == null) return;
    await _chatService.sendMessage(conversationId: _conversation!.id, senderId: user.uid, senderName: user.displayName ?? 'Customer', senderType: 'customer', content: _messageController.text.trim());
    _messageController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(_scrollController.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    return Scaffold(
      body: Container(
        decoration: AppDecorations.brandHeader,
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
                    const SizedBox(width: 8),
                    const CircleAvatar(backgroundColor: Colors.white, child: Icon(Icons.support_agent, color: AppColors.primary)),
                    const SizedBox(width: 12),
                    const Expanded(child: Text('Support Chat', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white))),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30))),
                  child: _conversation == null
                      ? const Center(child: CircularProgressIndicator())
                      : Column(
                          children: [
                            Expanded(
                              child: StreamBuilder<List<Message>>(
                                stream: _chatService.getMessages(_conversation!.id),
                                builder: (context, snapshot) {
                                  if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
                                  final messages = snapshot.data ?? [];
                                  if (messages.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey[300]), const SizedBox(height: 16), Text('Start a conversation', style: TextStyle(color: Colors.grey[600]))]));
                                  WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
                                  return ListView.builder(
                                    controller: _scrollController,
                                    padding: const EdgeInsets.all(16),
                                    itemCount: messages.length,
                                    itemBuilder: (context, index) {
                                      final message = messages[index];
                                      final isMe = message.senderId == user?.uid;
                                      return _MessageBubble(message: message, isMe: isMe);
                                    },
                                  );
                                },
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))]),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _messageController,
                                      decoration: InputDecoration(hintText: 'Type a message...', border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none), filled: true, fillColor: Colors.grey[100], contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12)),
                                      onSubmitted: (_) => _sendMessage(),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Container(
                                    decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                                    child: IconButton(icon: const Icon(Icons.send, color: Colors.white), onPressed: _sendMessage),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}

class _MessageBubble extends StatelessWidget {
  final Message message;
  final bool isMe;
  const _MessageBubble({required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isMe) ...[CircleAvatar(radius: 16, backgroundColor: AppColors.primary.withValues(alpha: 0.1), child: const Icon(Icons.support_agent, size: 18, color: AppColors.primary)), const SizedBox(width: 8)],
          Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.7),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isMe ? AppColors.primary : Colors.grey[100],
              borderRadius: BorderRadius.only(topLeft: const Radius.circular(20), topRight: const Radius.circular(20), bottomLeft: Radius.circular(isMe ? 20 : 4), bottomRight: Radius.circular(isMe ? 4 : 20)),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (!isMe) Text(message.senderName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey[700])),
              Text(message.content, style: TextStyle(color: isMe ? Colors.white : Colors.black87)),
              const SizedBox(height: 4),
              Text(DateFormat('h:mm a').format(message.createdAt), style: TextStyle(fontSize: 10, color: isMe ? Colors.white70 : Colors.grey[500])),
            ]),
          ),
        ],
      ),
    );
  }
}
