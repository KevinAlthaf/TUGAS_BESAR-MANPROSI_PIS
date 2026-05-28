import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function PesanSupport() {
  const { supportMessages, addSupportMessage } = useData();
  const [replyText, setReplyText] = useState('');
  const chatEndRef = useRef(null);

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    addSupportMessage(replyText, 'Operator');
    setReplyText('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [supportMessages]);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="text-blue-500" />
          Pesan Bantuan (Inbox)
        </h2>
        <p className="text-gray-500 text-sm mt-1">Balas pesan dan pertanyaan dari pihak HRD.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Support Channel (HRD)</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F8F9FA]">
          {supportMessages.map((msg, idx) => {
            const isOperator = msg.senderRole === 'Operator';
            return (
              <div key={msg.id || idx} className={`flex ${isOperator ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg p-4 rounded-2xl text-sm shadow-sm ${
                  isOperator ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  <p className="text-xs opacity-75 mb-1 font-medium">{isOperator ? 'Anda (Operator)' : 'HRD'}</p>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Reply Input */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleReply} className="flex gap-3">
            <input 
              type="text" 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Tulis balasan untuk HRD..." 
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
            />
            <button 
              type="submit" 
              className="px-6 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              Kirim
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
