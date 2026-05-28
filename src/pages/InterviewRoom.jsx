import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MonitorUp, Settings, Mic, MicOff, Video, VideoOff, MessageSquare, Clock, X, Send } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomName = queryParams.get('roomName') || 'Interview Session';

  const { applicants } = useData();
  const applicant = applicants.find(a => a.id === parseInt(id));

  // Controls State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'system', text: `Selamat datang di ${roomName}` }
  ]);
  const chatEndRef = useRef(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMic, setSelectedMic] = useState('default');
  const [selectedCamera, setSelectedCamera] = useState('default');

  // WebRTC Refs & States
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // Setup WebRTC Media
  useEffect(() => {
    let activeStream = null;
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        activeStream = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Gagal mengakses kamera/mic:", err);
        // Fallback or alert can be added here
      }
    }
    setupMedia();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Only on mount

  // Sync Video/Audio Toggle
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
      });
    }
  }, [isMicOn, isVideoOn, localStream]);

  // Sync Screen Stream to Ref when it changes
  useEffect(() => {
    if (isScreenSharing && screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [isScreenSharing, screenStream]);

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        // Listen for user stopping screen share via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
      } catch (err) {
        console.error("Gagal share screen:", err);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    // Stop tracks before leaving
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    navigate('/pelamar');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'Anda', text: newMessage }]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-[#1a1c29] flex overflow-hidden relative font-sans">
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col items-center justify-between p-6 relative transition-all duration-300 ${isChatOpen ? 'mr-80' : ''}`}>
        
        {/* Top Timer */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="bg-white text-gray-800 px-4 py-2 rounded-md shadow flex items-center gap-2 font-medium text-sm">
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <div className="text-gray-400 text-xs mt-2">{roomName}</div>
        </div>

        {/* Video Grid */}
        <div className="w-full max-w-6xl flex-1 flex flex-col md:flex-row items-center justify-center gap-6 mt-16 mb-24 transition-all">
          
          {/* Local Video (HRD) */}
          <div className={`aspect-video bg-gray-900 rounded-3xl overflow-hidden relative shadow-lg transition-all ${isScreenSharing ? 'w-1/4 absolute bottom-24 right-6 z-20 border-2 border-blue-500' : 'w-full md:w-1/2'}`}>
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline 
              muted // Always muted locally to prevent echo
              className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-white">
                  <VideoOff size={32} />
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium">
              Anda (HRD) {!isMicOn && ' - Muted'}
            </div>
          </div>

          {/* Remote Video (Applicant) or Screen Share Main view */}
          <div className={`aspect-video bg-gray-900 rounded-3xl overflow-hidden relative shadow-lg transition-all ${isScreenSharing ? 'w-full max-w-5xl' : 'w-full md:w-1/2'}`}>
            {isScreenSharing ? (
              <video 
                ref={screenVideoRef}
                autoPlay 
                playsInline 
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Pelamar Video" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium">
              {isScreenSharing ? 'Layar Anda' : (applicant ? applicant.name : 'Pelamar')}
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-6 w-full max-w-6xl flex items-center justify-between px-6 z-10">
          
          {/* Left: Screen Share */}
          <div>
            <button 
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-xl border transition-colors flex items-center justify-center ${isScreenSharing ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'border-gray-600 bg-[#242736] text-white hover:bg-gray-700'}`}
              title="Bagikan Layar"
            >
              <MonitorUp size={24} />
            </button>
          </div>

          {/* Center: Controls & End Session */}
          <div className="flex items-center gap-4 bg-[#242736] px-6 py-2 rounded-2xl shadow-lg border border-gray-700">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
              title="Pengaturan"
            >
              <Settings size={22} />
            </button>
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMicOn ? 'bg-gray-200 text-gray-800 hover:bg-white' : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
              title="Toggle Mic"
            >
              {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOn ? 'bg-gray-200 text-gray-800 hover:bg-white' : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
              title="Toggle Camera"
            >
              {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
            </button>

            <div className="w-px h-8 bg-gray-600 mx-2"></div>

            <button 
              onClick={handleEndSession}
              className="bg-[#e53935] hover:bg-[#d32f2f] text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-[0_0_15px_rgba(229,57,53,0.3)]"
            >
              <X size={20} strokeWidth={3} /> Akhiri Sesi
            </button>
          </div>

          {/* Right: Chat */}
          <div>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-12 h-12 rounded-xl border transition-colors flex items-center justify-center relative ${isChatOpen ? 'bg-white border-white text-gray-900' : 'border-gray-600 bg-[#242736] text-white hover:bg-gray-700'}`}
              title="Buka Chat"
            >
              <MessageSquare size={24} />
              {!isChatOpen && chatMessages.length > 1 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Chat Sidebar */}
      <div className={`fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" /> Pesan Ruangan
          </h3>
          <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-white space-y-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'Anda' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'}`}>
              {msg.sender === 'system' ? (
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{msg.text}</span>
              ) : (
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.sender === 'Anda' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              )}
              {msg.sender !== 'system' && <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.sender}</span>}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..." 
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <button type="submit" disabled={!newMessage.trim()} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors shrink-0">
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Settings size={20} className="text-gray-600" /> Pengaturan Perangkat
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mikrofon (Audio Input)</label>
                <select 
                  value={selectedMic} 
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="default">Default - Mikrofon Bawaan</option>
                  <option value="external">External USB Microphone</option>
                  <option value="headset">Headset Microphone</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kamera (Video Input)</label>
                <select 
                  value={selectedCamera} 
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="default">Default - HD Web Camera</option>
                  <option value="virtual">OBS Virtual Camera</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-6">
                <p className="text-xs text-blue-700">Perubahan pengaturan akan otomatis tersimpan. Pastikan browser Anda memiliki izin akses ke perangkat yang dipilih.</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
