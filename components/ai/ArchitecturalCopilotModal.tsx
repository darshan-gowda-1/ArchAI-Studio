'use client';

import React, { useState } from 'react';
import { SiteInformation, BuildingRequirements, CandidateDesign } from '@/types/architecture';
import { processArchitecturalCopilot, CopilotChatMessage } from '@/lib/api/openaiVisionApi';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ArchitecturalCopilotModalProps {
  site: SiteInformation;
  requirements: BuildingRequirements;
  activeDesign: CandidateDesign;
  onApplyAction?: (actionType: string, payload?: any) => void;
  onClose: () => void;
}

export const ArchitecturalCopilotModal: React.FC<ArchitecturalCopilotModalProps> = ({
  site,
  requirements,
  activeDesign,
  onApplyAction,
  onClose,
}) => {
  const [messages, setMessages] = useState<CopilotChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: `Hello! I am your ArchAI Engineering Copilot. I have analyzed your ${site.length}ft × ${site.width}ft plot in ${site.locationState || 'Site location'}. How can I assist you with space planning, Vastu Shastra, building regulations, or BIM workflows?`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: CopilotChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const botResponse = await processArchitecturalCopilot(textToSend, site, requirements);
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Align layout with Vedic Vastu Shastra',
    'Verify Karnataka BBMP setback compliance',
    'Add another floor and evaluate structural loads',
    'Prepare IFC4 export for Autodesk Revit',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-slate-200 shadow-2xl space-y-4 flex flex-col h-[75vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 text-sky-400 font-bold text-base">
            <Sparkles className="w-5 h-5" />
            <span>AI Architectural & BIM Engineering Copilot</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2.5 py-1 rounded-lg bg-slate-800"
          >
            ✕ Close
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 font-medium whitespace-nowrap transition text-[11px]"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                {msg.suggestedAction && (
                  <div className="pt-1">
                    <button
                      onClick={() => onApplyAction && onApplyAction(msg.suggestedAction!.type, msg.suggestedAction!.payload)}
                      className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[11px] rounded-xl border border-sky-500/30 transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{msg.suggestedAction.label}</span>
                    </button>
                  </div>
                )}

                <span className="text-[9px] text-slate-400 block text-right font-mono">
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-slate-400 text-xs pl-2">
              <Sparkles className="w-4 h-4 animate-spin text-sky-400" />
              <span>Analyzing architectural parameters & building codes...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 border-t border-slate-800 pt-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Copilot about room layouts, setbacks, Vastu, or BIM exports..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
