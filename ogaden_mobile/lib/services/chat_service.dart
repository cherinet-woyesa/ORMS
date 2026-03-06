import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ogaden_mobile/models/chat_model.dart';

class ChatService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<Conversation> getOrCreateConversation(String userId, String userName) async {
    final querySnapshot = await _firestore
        .collection('conversations')
        .where('userId', isEqualTo: userId)
        .limit(1)
        .get();

    if (querySnapshot.docs.isNotEmpty) {
      return Conversation.fromMap(querySnapshot.docs.first.data());
    }

    final conversation = Conversation(
      id: 'conv_${userId}_${DateTime.now().millisecondsSinceEpoch}',
      userId: userId,
      userName: userName,
      createdAt: DateTime.now(),
    );

    await _firestore
        .collection('conversations')
        .doc(conversation.id)
        .set(conversation.toMap());

    return conversation;
  }

  Stream<List<Conversation>> getConversations() {
    return _firestore
        .collection('conversations')
        .snapshots()
        .map((snapshot) {
          final list = snapshot.docs
              .map((doc) => Conversation.fromMap(doc.data()))
              .toList();
          list.sort((a, b) {
            final aTime = a.lastMessageAt ?? a.createdAt;
            final bTime = b.lastMessageAt ?? b.createdAt;
            return bTime.compareTo(aTime);
          });
          return list;
        });
  }

  Stream<List<Message>> getMessages(String conversationId) {
    return _firestore
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .snapshots()
        .map((snapshot) {
          final list = snapshot.docs
              .map((doc) => Message.fromMap(doc.data()))
              .toList();
          list.sort((a, b) => a.createdAt.compareTo(b.createdAt));
          return list;
        });
  }

  Future<void> sendMessage({
    required String conversationId,
    required String senderId,
    required String senderName,
    required String senderType,
    required String content,
  }) async {
    final message = Message(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      conversationId: conversationId,
      senderId: senderId,
      senderName: senderName,
      senderType: senderType,
      content: content,
      createdAt: DateTime.now(),
    );

    await _firestore
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .doc(message.id)
        .set(message.toMap());

    await _firestore
        .collection('conversations')
        .doc(conversationId)
        .update({
      'lastMessage': content,
      'lastMessageAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> markAsRead(String conversationId, String userId) async {
    final messages = await _firestore
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .where('senderId', isNotEqualTo: userId)
        .where('isRead', isEqualTo: false)
        .get();

    for (var doc in messages.docs) {
      await doc.reference.update({'isRead': true});
    }

    await _firestore
        .collection('conversations')
        .doc(conversationId)
        .update({'unreadCount': 0});
  }

  Future<void> closeConversation(String conversationId) async {
    await _firestore
        .collection('conversations')
        .doc(conversationId)
        .update({'status': 'closed'});
  }

  Future<int> getUnreadCount(String userId) async {
    final doc = await _firestore
        .collection('conversations')
        .where('userId', isEqualTo: userId)
        .get();

    int total = 0;
    for (var d in doc.docs) {
      total += (d.data()['unreadCount'] ?? 0) as int;
    }
    return total;
  }
}
