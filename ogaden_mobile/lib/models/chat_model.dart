class Message {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String senderType; // 'customer', 'admin', 'staff'
  final String content;
  final DateTime createdAt;
  final bool isRead;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    required this.senderType,
    required this.content,
    required this.createdAt,
    this.isRead = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'conversationId': conversationId,
      'senderId': senderId,
      'senderName': senderName,
      'senderType': senderType,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'isRead': isRead,
    };
  }

  factory Message.fromMap(Map<String, dynamic> map) {
    return Message(
      id: map['id'] ?? '',
      conversationId: map['conversationId'] ?? '',
      senderId: map['senderId'] ?? '',
      senderName: map['senderName'] ?? '',
      senderType: map['senderType'] ?? 'customer',
      content: map['content'] ?? '',
      createdAt: DateTime.parse(map['createdAt']),
      isRead: map['isRead'] ?? false,
    );
  }
}

class Conversation {
  final String id;
  final String userId;
  final String userName;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;
  final String status;
  final DateTime createdAt;

  Conversation({
    required this.id,
    required this.userId,
    required this.userName,
    this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
    this.status = 'open',
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'lastMessage': lastMessage,
      'lastMessageAt': lastMessageAt?.toIso8601String(),
      'unreadCount': unreadCount,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Conversation.fromMap(Map<String, dynamic> map) {
    return Conversation(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      userName: map['userName'] ?? '',
      lastMessage: map['lastMessage'],
      lastMessageAt: map['lastMessageAt'] != null
          ? DateTime.parse(map['lastMessageAt'])
          : null,
      unreadCount: map['unreadCount'] ?? 0,
      status: map['status'] ?? 'open',
      createdAt: map['createdAt'] != null 
          ? DateTime.parse(map['createdAt']) 
          : DateTime.now(),
    );
  }
}
