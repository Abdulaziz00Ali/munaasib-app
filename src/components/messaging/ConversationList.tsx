
import React from 'react';
import { User } from 'lucide-react';
import { Conversation } from '@/pages/Messages.tsx';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  return (
    <div className="h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">المحادثات</h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-80px)]">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedConversation === conversation.id ? 'bg-munaasib-red/10 border-l-4 border-l-munaasib-red' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {conversation.avatar ? (
                  <img
                    src={conversation.avatar}
                    alt={conversation.participantName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.participantName}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {conversation.lastMessageTime}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate flex-1">
                    {conversation.lastMessage}
                  </p>
                  
                  {conversation.unreadCount > 0 && (
                    <span className="bg-munaasib-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mr-2">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    conversation.participantType === 'customer' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {conversation.participantType === 'customer' ? 'زبون' : 'مقدم خدمة'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
