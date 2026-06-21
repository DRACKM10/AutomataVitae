"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Bot, Loader2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  sender_role: 'user' | 'ai' | 'system';
  content: string;
}

interface InterviewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cvAnalysisId: string | null;
  userId: string | null;
}

export function InterviewChatModal({ open, onOpenChange, cvAnalysisId, userId }: InterviewChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Iniciar la sesión al abrir el modal
  useEffect(() => {
    if (open && cvAnalysisId && userId && !sessionId) {
      startInterview();
    }
  }, [open, cvAnalysisId, userId]);

  // Limpiar estado cuando se cierra
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setSessionId(null);
      setInputText('');
    }
  }, [open]);

  const startInterview = async () => {
    if (!cvAnalysisId || !userId) return;
    
    setIsInitializing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/ia/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cv_analysis_id: cvAnalysisId,
          user_id: userId
        })
      });

      if (!response.ok) throw new Error('Error al iniciar la entrevista');

      const data = await response.json();
      setSessionId(data.session.id);
      setMessages([data.message]); // El saludo inicial de la IA
    } catch (error) {
      toast.error('No se pudo iniciar la entrevista. Intenta de nuevo más tarde.');
      console.error(error);
      onOpenChange(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !sessionId || !cvAnalysisId) return;

    const userMessageContent = inputText.trim();
    setInputText('');
    
    // Optimistic UI: Mostrar el mensaje del usuario inmediatamente
    const tempUserMsg: Message = { id: Date.now().toString(), sender_role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/ia/interview/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          session_id: sessionId,
          cv_analysis_id: cvAnalysisId,
          content: userMessageContent
        })
      });

      if (!response.ok) throw new Error('Error al enviar el mensaje');

      const data = await response.json();
      setMessages(prev => [...prev, data.message]); // El mensaje de la IA
    } catch (error) {
      toast.error('Error al enviar el mensaje. Verifica tu conexión.');
      console.error(error);
      // Opcional: Podríamos remover el mensaje optimista si falló, pero por simplicidad lo dejamos.
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[85vh] p-0 flex flex-col bg-slate-50 dark:bg-[#09090b] border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Cabecera del Chat */}
        <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1117] shadow-sm shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
            <PlayCircle className="w-5 h-5" />
            Simulador de Entrevista IA
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            El reclutador virtual evaluará tus conocimientos basándose en tu CV. Responde como en una entrevista real.
          </DialogDescription>
        </DialogHeader>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isInitializing ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p>Conectando con el reclutador...</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-3 ${msg.sender_role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender_role === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'}`}>
                    {msg.sender_role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.sender_role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Zona de Input */}
        <div className="p-4 bg-white dark:bg-[#0f1117] border-t border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex gap-2">
            <Textarea
              placeholder="Escribe tu respuesta aquí..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInitializing || isTyping}
              className="resize-none min-h-[50px] max-h-[120px] py-3 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500"
              rows={1}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isInitializing || isTyping}
              className="h-auto shrink-0 bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Presiona <strong>Enter</strong> para enviar. Las entrevistas de prueba ayudan a prepararte para escenarios reales.
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
}
