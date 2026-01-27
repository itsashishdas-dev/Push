
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Hash, Users, MessageSquare } from 'lucide-react';
import { backend } from '../services/mockBackend';
import { useAppStore } from '../store';
import { ChatMessage } from '../types';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface ChatModalProps {
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
  const { chatChannel, user } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatChannel) {
        loadMessages();
        // Polling for new messages (simulate live)
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }
  }, [chatChannel]);

  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
      if (!chatChannel) return;
      const msgs = await backend.getChatMessages(chatChannel.id);
      setMessages(msgs);
      setIsLoading(false);
  };

  const handleSend = async () => {
      if (!inputText.trim() || !chatChannel) return;
      
      const text = inputText;
      setInputText('');
      triggerHaptic('light');
      playSound('click');

      await backend.sendChatMessage(chatChannel.id, text);
      await loadMessages();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSend();
      }
  };

  if (!chatChannel) return null;

  return (
    <div className="fixed inset-0 z-[9000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-view">
      
      {/* Container */}
      <div className="w-full max-w-lg h-[80vh] bg-[#050505] border border-white/10 rounded-[2rem] shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0b0c10]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400">
                    <Hash size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase italic text-white tracking-wide">{chatChannel.title}</h3>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Live Comms
                    </p>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 border border-white/5 flex items-center justify-center hover:text-white transition-colors active:scale-95"
            >
                <X size={16} />
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2 opacity-50">
                    <MessageSquare size={32} />
                    <span className="text-[10px] font-mono uppercase tracking-widest">No transmissions yet.</span>
                </div>
            )}
            
            {messages.map((msg) => {
                const isMe = msg.userId === user?.id;
                return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            {!isMe && <span className="text-[9px] font-bold text-slate-400 uppercase">{msg.userName}</span>}
                            <span className="text-[8px] font-mono text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-lg border ${
                            isMe 
                            ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-sm' 
                            : 'bg-[#151515] text-slate-200 border-white/10 rounded-tl-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0b0c10] border-t border-white/10 shrink-0">
            <div className="flex gap-2 items-center bg-[#151515] rounded-xl px-4 py-1 border border-white/10 focus-within:border-indigo-500/50 transition-colors shadow-inner">
                <span className="text-indigo-500 font-mono text-xs">{'>'}</span>
                <input 
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none py-3 placeholder:text-slate-600 font-mono" 
                    placeholder="ENTER MESSAGE..." 
                    value={inputText} 
                    onChange={e => setInputText(e.target.value)} 
                    onKeyDown={handleKeyDown} 
                />
                <button 
                    onClick={handleSend} 
                    disabled={!inputText.trim()} 
                    className="p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 active:scale-95 transition-transform"
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
