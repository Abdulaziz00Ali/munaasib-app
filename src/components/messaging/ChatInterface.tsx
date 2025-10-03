
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Send, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Conversation, Message } from '@/pages/Messages.tsx';
import { useToast } from '@/hooks/use-toast.ts';

interface ChatInterfaceProps {
  conversation: Conversation;
  messages: Message[];
  onBack: () => void;
  onSendMessage?: (message: string) => void;
  currentUserId?: string;
  currentUserType?: 'customer' | 'vendor';
  whatsappUrl?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  messages,
  onBack,
  onSendMessage,
  currentUserId,
  currentUserType,
  whatsappUrl,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const effectiveCurrentUserId = currentUserId || 'vendor1'; // fallback for compatibility

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      if (onSendMessage) {
        onSendMessage(newMessage);
      }
      toast({
        title: 'تم إرسال الرسالة',
        description: 'تم إرسال رسالتك بنجاح',
      });
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowRight className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          {conversation.avatar ? (
            <img
              src={conversation.avatar}
              alt={conversation.participantName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {conversation.participantName}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                conversation.participantType === 'customer'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {conversation.participantType === 'customer' ? 'زبون' : 'مقدم خدمة'}
            </span>
          </div>
        </div>

        {whatsappUrl && (
          <Button
            onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            تواصل عبر واتساب
            <ExternalLink className="h-4 w-4 mr-2 ml-1" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === effectiveCurrentUserId;

          return (
            <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage ? 'bg-munaasib-red text-white' : 'bg-gray-100 text-gray-900'
                }`}
                dir="rtl"
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-red-100' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1"
            dir="rtl"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="bg-munaasib-red hover:bg-munaasib-red/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
