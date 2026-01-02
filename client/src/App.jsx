import React, { useState } from 'react';
import { Upload, Heart, ChevronRight, Activity, Zap, CheckCircle2 } from 'lucide-react';

function App() {
    const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'report'
    const [files, setFiles] = useState([]);
    const [analysisLogs, setAnalysisLogs] = useState([]);
    const [result, setResult] = useState(null);

    // Helper to compress image
    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Resize to reasonable width for API
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Quality 0.7 JPEG
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
        });
    };

    const handleAnalyze = async () => {
        if (files.length < 1) {
            alert("请至少上传 1 张截图以获得准确分析。");
            return;
        }
        setStep('analyzing');
        setAnalysisLogs(["正在加密图片...", "准备上传..."]);

        try {
            // 1. Convert images to Base64 (Compressed)
            setAnalysisLogs(prev => [...prev, "图像压缩处理中..."]);

            const promises = files.map(file => compressImage(file));
            const imagesBase64 = await Promise.all(promises);

            // 2. Call Backend
            setAnalysisLogs(prev => [...prev, "连接云端大脑...", "AI 正在深度思考 (需30-60秒)..."]);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ images: imagesBase64 }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Analysis failed');
            }

            setAnalysisLogs(prev => [...prev, "思考完成，正在生成报告..."]);
            const data = await response.json();

            setResult(data);
            setStep('report');

        } catch (error) {
            console.error(error);
            alert("分析失败: " + error.message);
            setStep('upload');
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500/30 font-sans">

            {/* Navbar / Header */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                        <span className="font-bold text-lg tracking-tight">Crush Decoder</span>
                    </div>
                    <div className="text-sm text-slate-400">
                        V1.0
                    </div>
                </div>
            </nav>

            {/* Main Container */}
            <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">

                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-tight py-2">
                                读懂 TA 的朋友圈<br />让喜欢不再是单向奔赴
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                上传 5 张以上朋友圈截图，AI 追求高手为你破解 TA 的性格密码，定制专属恋爱攻略。
                            </p>
                        </div>

                        <div className="border-2 border-dashed border-slate-800 hover:border-rose-500/50 transition-colors rounded-3xl p-12 text-center bg-slate-900/50 backdrop-blur-sm group cursor-pointer relative overflow-hidden">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleFileChange}
                            />
                            <div className="flex flex-col items-center gap-4 relative z-0">
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-rose-400 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-lg text-slate-200">点击或拖拽上传截图</p>
                                    <p className="text-sm text-slate-500">支持 5-20 张图片 (JPG/PNG)</p>
                                </div>
                                {files.length > 0 && (
                                    <div className="mt-8 w-full animate-in zoom-in fade-in space-y-4">
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {files.map((file, i) => (
                                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:border-rose-500/30 transition-colors bg-slate-800">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="inline-block px-4 py-1.5 bg-rose-500/10 text-rose-400 rounded-full text-sm font-medium border border-rose-500/20">
                                            已选择 {files.length} 张图片
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleAnalyze}
                                disabled={files.length === 0}
                                className="px-8 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold text-lg shadow-lg shadow-rose-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Zap className="w-5 h-5 fill-white" />
                                生成恋爱攻略
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Analyzing */}
                {step === 'analyzing' && (
                    <div className="max-w-xl mx-auto space-y-8 py-20 animate-in fade-in duration-500">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">AI 正在深度思考...</h2>
                        </div>

                        <div className="space-y-4">
                            {analysisLogs.map((log, index) => (
                                <div key={index} className="flex items-center gap-3 text-slate-300 animate-in slide-in-from-bottom-2 fade-in">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span>{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Report */}
                {step === 'report' && result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-12 space-y-10 shadow-2xl shadow-black/50">

                            {/* Score */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2 text-white">分析报告</h2>
                                    <p className="text-slate-400">基于 {files.length} 张朋友圈截图</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-400 mb-1">攻略匹配度</div>
                                    <div className="text-5xl font-black text-emerald-400 tracking-tighter">{result.score || 85}%</div>
                                </div>
                            </div>

                            {/* Insight */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-rose-400">
                                    <Activity className="w-5 h-5" />
                                    高手洞察
                                </h3>
                                <div className="prose prose-invert max-w-none text-lg leading-relaxed text-slate-300 p-4 border-l-4 border-rose-500/50 bg-slate-800/20">
                                    <p>{result.insight}</p>
                                </div>
                                <div className="prose prose-invert max-w-none text-md leading-relaxed text-slate-400">
                                    <p><strong className="text-slate-200">核心需求：</strong> {result.needs}</p>
                                </div>
                            </div>

                            {/* Action Plan */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                                    <Zap className="w-5 h-5" />
                                    行动必杀技
                                </h3>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {result.actions && result.actions.length > 0 ? (
                                        result.actions.map((action, idx) => (
                                            <div key={idx} className="p-6 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
                                                <div className="text-4xl mb-4">
                                                    {idx === 0 ? '🎯' : idx === 1 ? '📍' : '⚠️'}
                                                </div>
                                                <h4 className="font-bold mb-2 text-white">{action.title}</h4>
                                                <p className="text-sm text-slate-400 leading-relaxed">{action.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-500">无法生成建议</div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 text-center">
                                <button
                                    onClick={() => {
                                        setFiles([]);
                                        setAnalysisLogs([]);
                                        setResult(null);
                                        setStep('upload');
                                    }}
                                    className="text-slate-500 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4 cursor-pointer">
                                    重新分析其他对象
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default App;
