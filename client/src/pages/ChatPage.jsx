import { useOutletContext } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';
import InputBar from '../components/chat/InputBar';

export default function ChatPage() {
  const {
    messages,
    isLoading,
    streamSteps,
    activePersonaId,
    PERSONAS,
    setActivePersonaId,
    handleSuggestion,
    handleSubmit,
    activeProject,
    refreshMemories,
    panelBase,
    identity,
    autoSave,
    toggleAutoSave,
    extractMemory,
    chatTag,
    setChatTag,
  } = useOutletContext();

  return (
    <>
      {/* ── ZONE 3B — Chat Area ───────────────────────────────────────── */}
      <div className="zone-chat">
        <main
          className="chat-panel"
          style={{ ...panelBase, flex: 1, border: 'none', borderRadius: 0, boxShadow: 'none' }}
        >
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            streamSteps={streamSteps}
            activePersonaId={activePersonaId}
            personas={PERSONAS}
            onPersonaChange={setActivePersonaId}
            onSuggestionClick={handleSuggestion}
            activeProject={activeProject}
            onUploadSuccess={refreshMemories}
            identity={identity}
            autoSave={autoSave}
            toggleAutoSave={toggleAutoSave}
            extractMemory={extractMemory}
          />
        </main>
      </div>

      {/* ── ZONE 4 — Input Bar ───────────────────────────────────────── */}
      <div className="zone-inputbar">
        <InputBar
          onSubmit={handleSubmit}
          disabled={isLoading}
          activePersonaId={activePersonaId}
          onPersonaChange={setActivePersonaId}
          personas={PERSONAS}
          activeProject={activeProject}
          onUploadSuccess={refreshMemories}
          chatTag={chatTag}
          setChatTag={setChatTag}
        />
      </div>
    </>
  );
}
