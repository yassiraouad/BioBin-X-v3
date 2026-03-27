// pages/scan.js
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemo } from '../hooks/useDemo';
import Layout from '../components/layout/Layout';
import { logWaste } from '../firebase/db';
import { useRouter } from 'next/router';
import { Camera, RotateCcw, Check, Scale, Zap, Wind, Leaf, X, Upload, Brain, AlertTriangle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { classifyWasteFromDataUrl, loadModel } from '../utils/wasteClassifier';

export default function ScanPage() {
  const { user, userData, refreshUserData } = useAuth();
  const { isDemo, addScan } = useDemo();
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      toast.error('Kamera ikke tilgjengelig. Sjekk tillatelser.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    loadModel().then(() => setModelLoaded(true)).catch(console.error);
    return () => stopCamera();
  }, [startCamera]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();

    setAnalyzing(true);
    try {
      const analysis = await classifyWasteFromDataUrl(imageData);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error('AI analysis failed:', err);
      setAiAnalysis({ isOrganic: true, confidence: 0.5, label: 'Analysis unavailable' });
    } finally {
      setAnalyzing(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setResult(null);
    setWeight('');
    setAiAnalysis(null);
    startCamera();
  };

  const handleSave = async () => {
    if (!weight || parseFloat(weight) <= 0) return toast.error('Skriv inn vekt (kg)');
    if (!user && !isDemo) return;

    if (aiAnalysis && !aiAnalysis.isOrganic) {
      toast.error('Dette ser ut til å være ikke-organisk avfall. BioBin godtar kun matavfall!');
      return;
    }

    setSaving(true);
    try {
      if (isDemo) {
        const weightNum = parseFloat(weight);
        const points = Math.round(weightNum * 10);
        const energy = weightNum * 0.5;
        const co2 = weightNum * 0.8;
        
        addScan(weightNum);
        
        setResult({
          points,
          energyKwh: energy,
          co2Saved: co2,
          totalWaste: weightNum,
        });
      } else {
        const data = await logWaste({
          userId: user.id,
          weight: parseFloat(weight),
          imageUrl: null,
          classId: userData?.classId || null,
          aiClassification: aiAnalysis,
        });
        setResult(data);
        await refreshUserData();
      }
    } catch (err) {
      toast.error('Klarte ikke lagre. Prøv igjen.');
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <Layout>
        <div className="p-6 max-w-md mx-auto">
          <div className="bio-card p-8 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-bio-500/20 border-2 border-bio-500 flex items-center justify-center mx-auto mb-6 bio-glow">
              <Check size={36} className="text-bio-400" />
            </div>
            <h2 className="font-display font-700 text-white text-2xl mb-2">Registrert! 🎉</h2>
            <p className="text-slate-400 font-body mb-8">Bra jobba! Du bidrar til en grønnere fremtid.</p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Zap, label: 'Poeng', value: `+${result.points}`, color: 'earth' },
                { icon: Leaf, label: 'Energi', value: `${result.energyKwh.toFixed(2)} kWh`, color: 'bio' },
                { icon: Wind, label: 'CO₂ spart', value: `${result.co2Saved.toFixed(2)} kg`, color: 'moss' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`p-4 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                  <Icon size={18} className={`text-${color}-400 mx-auto mb-2`} />
                  <div className={`font-display font-700 text-${color}-300 text-sm`}>{value}</div>
                  <div className="text-slate-500 text-xs font-body mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={retake} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-bio-border text-slate-300 hover:text-white hover:border-bio-500/30 transition-all font-body">
                <Camera size={16} /> Nytt kast
              </button>
              <button onClick={() => router.push('/dashboard/student')} className="btn-primary flex-1">
                Tilbake
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-700 text-white text-2xl mb-1">Skann matavfall 📸</h1>
            <div className="flex items-center gap-2">
              {modelLoaded ? (
                <span className="flex items-center gap-1 text-xs text-bio-400 bg-bio-500/10 px-2 py-1 rounded-full">
                  <Brain size={12} />
                  AI klar
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                  <Brain size={12} />
                  Laster AI...
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-400 font-body text-sm">Ta bilde av maten og skriv inn vekt</p>
        </div>

        {/* Camera/preview */}
        <div className="relative rounded-2xl overflow-hidden bg-dark-800 border border-bio-border mb-5 aspect-[4/3]">
          {!capturedImage ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {/* Overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-bio-400/50 rounded-2xl">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-bio-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-bio-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-bio-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-bio-400 rounded-br-lg" />
                </div>
              </div>
              {/* Flip camera */}
              <button
                onClick={() => { stopCamera(); setFacingMode(f => f === 'environment' ? 'user' : 'environment'); }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all"
              >
                <RotateCcw size={16} />
              </button>
            </>
          ) : (
            <>
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              {aiAnalysis && !aiAnalysis.isOrganic && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 animate-fade-in">
                  <div className="w-24 h-24 rounded-full bg-red-500/80 flex items-center justify-center animate-pulse">
                    <X size={48} className="text-white" />
                  </div>
                </div>
              )}
              {aiAnalysis && aiAnalysis.isOrganic && (
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-bio-500/80 flex items-center justify-center animate-fade-in">
                  <Check size={16} className="text-white" />
                </div>
              )}
              <button onClick={retake} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all">
                <X size={16} />
              </button>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Capture button */}
        {!capturedImage && (
          <div className="flex flex-col items-center mb-5">
            <button
              onClick={capturePhoto}
              disabled={!modelLoaded}
              className={`w-16 h-16 rounded-full bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center bio-glow hover:scale-105 transition-transform active:scale-95 ${!modelLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Camera size={26} className="text-white" />
            </button>
            {!modelLoaded && (
              <p className="text-slate-500 text-xs mt-2">Vent på AI-modell...</p>
            )}
          </div>
        )}

        {/* AI Analysis Result */}
        {capturedImage && (
          <div className="mb-5 animate-slide-up">
            {analyzing ? (
              <div className="p-4 rounded-xl bg-bio-500/10 border border-bio-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bio-500/20 flex items-center justify-center">
                  <Brain size={20} className="text-bio-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-white font-body font-500">AI analyserer bildet...</p>
                  <p className="text-slate-400 text-xs">Vennligst vent</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              aiAnalysis.isOrganic ? (
                <div className="p-4 rounded-xl bg-bio-500/10 border border-bio-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-bio-500/20 flex items-center justify-center">
                      <Sparkles size={20} className="text-bio-400" />
                    </div>
                    <div>
                      <p className="text-bio-300 font-body font-600">Organisk matavfall oppdaget!</p>
                      <p className="text-slate-400 text-xs">{aiAnalysis.label} ({(aiAnalysis.confidence * 100).toFixed(0)}% sikkerhet)</p>
                    </div>
                  </div>
                  {aiAnalysis.allPredictions && aiAnalysis.allPredictions.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-bio-500/10">
                      <p className="text-slate-500 text-xs mb-1">Andre forslag:</p>
                      <div className="flex flex-wrap gap-1">
                        {aiAnalysis.allPredictions.slice(1).map((pred, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                            {pred.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-300 font-body font-600">Ikke organisk avfall!</p>
                      <p className="text-slate-400 text-xs">{aiAnalysis.label} ({(aiAnalysis.confidence * 100).toFixed(0)}% sikkerhet)</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">BioBin godtar kun matavfall. Vennligst ta bilde av organiske matrester.</p>
                </div>
              )
            ) : null}
          </div>
        )}

        {/* Weight input */}
        {capturedImage && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="text-slate-300 text-sm font-body font-500 block mb-2 flex items-center gap-2">
                <Scale size={14} />
                Vekt (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="F.eks. 0.5"
                className="bio-input text-lg"
                autoFocus
              />
              {weight && parseFloat(weight) > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-bio-500/8 border border-bio-500/15 text-xs font-body text-bio-400">
                  ≈ +{Math.round(parseFloat(weight) * 10)} poeng · {(parseFloat(weight) * 0.5).toFixed(2)} kWh · {(parseFloat(weight) * 0.8).toFixed(2)} kg CO₂ spart
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !weight || (aiAnalysis && !aiAnalysis.isOrganic)}
              className={`btn-primary w-full flex items-center justify-center gap-2 py-4 text-base ${aiAnalysis && !aiAnalysis.isOrganic ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Check size={18} /> Lagre registrering</>
              )}
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/6">
          <p className="text-slate-400 text-sm font-body">
            💡 <strong className="text-slate-300">Tips:</strong> Vei matavfallet på en kjøkkenvekt for nøyaktig registrering. 1 kg gir 10 poeng!
          </p>
        </div>
      </div>
    </Layout>
  );
}
