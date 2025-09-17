import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { PlayIcon, PauseIcon, StopIcon, MicIcon } from './constants';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SliderControl: React.FC<SliderProps> = ({ label, value, min, max, step, onChange }) => (
  <div className="flex flex-col space-y-2">
    <label htmlFor={label} className="text-sm font-medium text-slate-600 flex justify-between">
      <span>{label}</span>
      <span className="font-bold text-sky-600">{value.toFixed(1)}</span>
    </label>
    <input
      id={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
    />
  </div>
);

const App: React.FC = () => {
  const [text, setText] = useState(
    "Hello! Welcome to the Text to Speech Synthesizer. You can type any text here and I will read it aloud for you. Try changing the voice, pitch, and rate for different effects."
  );
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  const { voices, speaking, paused, speak, pause, resume, cancel } = useSpeechSynthesis();

  const handleSpeak = () => {
    const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI) || null;
    speak(text, selectedVoice, rate, pitch);
  };
  
  useEffect(() => {
    if (voices.length > 0 && !selectedVoiceURI) {
        // Prefer a default English voice if available
        const defaultVoice = voices.find(voice => voice.lang.includes('en') && voice.name.includes('Google')) || voices[0];
        if(defaultVoice) {
            setSelectedVoiceURI(defaultVoice.voiceURI);
        }
    }
  }, [voices, selectedVoiceURI]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-slate-200 flex items-center justify-center p-4 font-sans">
      <main className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 space-y-6 border border-slate-200/50">
        <header className="text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
                <MicIcon className="w-8 h-8 text-sky-500" />
                <h1 className="text-3xl font-bold text-slate-800">
                    Text to Speech
                </h1>
            </div>
            <p className="text-slate-500">Bring your text to life with natural-sounding voices.</p>
        </header>

        <div className="space-y-4">
          <label htmlFor="text-input" className="sr-only">Text to speak</label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full p-4 border border-slate-300 rounded-lg shadow-inner focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-200 text-slate-700 placeholder-slate-400"
            placeholder="Enter text to speak..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="voice-select" className="text-sm font-medium text-slate-600">Voice</label>
              <select
                id="voice-select"
                value={selectedVoiceURI ?? ""}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                disabled={voices.length === 0}
                className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              >
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <SliderControl 
                    label="Rate"
                    value={rate}
                    min={0.5} max={2} step={0.1}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                />
                <SliderControl
                    label="Pitch"
                    value={pitch}
                    min={0} max={2} step={0.1}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 pt-4 border-t border-slate-200">
            <button
                onClick={handleSpeak}
                disabled={speaking || !text.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
                <PlayIcon className="w-6 h-6" />
                <span>{speaking ? "Speaking..." : "Speak"}</span>
            </button>
            <button
                onClick={paused ? resume : pause}
                disabled={!speaking}
                className="flex items-center justify-center p-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
                {paused ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6" />}
            </button>
            <button
                onClick={cancel}
                disabled={!speaking}
                className="flex items-center justify-center p-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
                <StopIcon className="w-6 h-6" />
            </button>
        </div>
      </main>
    </div>
  );
};

export default App;
