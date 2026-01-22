'use client';

import { useState } from 'react';
import { Volume2, PenTool, RotateCcw, XCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { hiragana, katakana, kanji } from '@/data/characters';
import DrawingCanvas from './DrawingCanvas';

export default function FlashcardApp() {
    const [mode, setMode] = useState(null); // 'hiragana', 'katakana', or 'kanji'
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [shuffledCards, setShuffledCards] = useState([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isWriting, setIsWriting] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
    const [gridVersion, setGridVersion] = useState(0);

    // Shuffle array helper
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Play pronunciation
    const playAudio = (e) => {
        e?.stopPropagation();
        if (!currentCard) return;

        const text = currentCard.char;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.8; // Slightly slower for clarity
        window.speechSynthesis.speak(utterance);
    };

    // Start a study session
    const startSession = (selectedMode) => {
        let cards;
        switch (selectedMode) {
            case 'hiragana':
                cards = hiragana;
                break;
            case 'katakana':
                cards = katakana;
                break;
            case 'kanji':
                cards = kanji;
                break;
            default:
                cards = [];
        }
        setMode(selectedMode);
        setShuffledCards(shuffleArray(cards));
        setCurrentIndex(0);
        setShowAnswer(false);
        setScore({ correct: 0, total: 0 });
        setIsFlipped(false);
        setIsWriting(false);
        setFeedback(null);
    };

    // Handle card flip
    const handleFlip = () => {
        if (!showAnswer) {
            setShowAnswer(true);
            playAudio();
        }
    };

    // Handle answer feedback
    const handleAnswer = (isCorrect) => {
        // Prevent double clicking
        if (feedback) return;

        const newFeedback = isCorrect ? 'correct' : 'incorrect';
        setFeedback(newFeedback);

        // Update score immediately for responsiveness
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
        }));

        // Move to next card after delay
        setTimeout(() => {
            if (currentIndex < shuffledCards.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setShowAnswer(false);
                setFeedback(null);
                // Don't reset writing mode if user prefers it
            } else {
                setMode('complete');
            }
        }, 800);
    };

    // Reset to mode selection
    const resetToMenu = () => {
        setMode(null);
        setCurrentIndex(0);
        setShowAnswer(false);
        setScore({ correct: 0, total: 0 });
        setIsFlipped(false);
        setIsWriting(false);
        setFeedback(null);
    };

    const currentCard = shuffledCards[currentIndex];
    const progress = shuffledCards.length > 0 ? ((currentIndex + 1) / shuffledCards.length) * 100 : 0;

    // Mode Selection Screen
    if (!mode) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono selection:bg-white selection:text-black">
                <div className="max-w-4xl w-full">
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-6xl font-extralight tracking-tight mb-4 text-white">
                            JAPANESE
                        </h1>
                        <p className="text-xs uppercase tracking-[0.5em] text-zinc-500">
                            Hiragana • Katakana • Kanji
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        {/* Hiragana Card */}
                        <Card
                            className="group cursor-pointer select-none bg-zinc-900/30 border-white/10 hover:border-white/30 hover:bg-zinc-900/50 transition-all duration-500 backdrop-blur-sm"
                            onClick={() => startSession('hiragana')}
                        >
                            <CardContent className="p-8 text-center">
                                <div className="text-5xl font-light mb-6 text-white group-hover:text-white transition-colors text-zinc-400">
                                    あ
                                </div>
                                <h2 className="text-sm uppercase tracking-widest font-medium mb-2 text-white">Hiragana</h2>
                                <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                                    {hiragana.length} characters
                                </div>
                            </CardContent>
                        </Card>

                        {/* Katakana Card */}
                        <Card
                            className="group cursor-pointer select-none bg-zinc-900/30 border-white/10 hover:border-white/30 hover:bg-zinc-900/50 transition-all duration-500 backdrop-blur-sm"
                            onClick={() => startSession('katakana')}
                        >
                            <CardContent className="p-8 text-center">
                                <div className="text-5xl font-light mb-6 text-white group-hover:text-white transition-colors text-zinc-400">
                                    ア
                                </div>
                                <h2 className="text-sm uppercase tracking-widest font-medium mb-2 text-white">Katakana</h2>
                                <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                                    {katakana.length} characters
                                </div>
                            </CardContent>
                        </Card>

                        {/* Kanji Card */}
                        <Card
                            className="group cursor-pointer select-none bg-zinc-900/30 border-white/10 hover:border-white/30 hover:bg-zinc-900/50 transition-all duration-500 backdrop-blur-sm"
                            onClick={() => startSession('kanji')}
                        >
                            <CardContent className="p-8 text-center">
                                <div className="text-5xl font-light mb-6 text-white group-hover:text-white transition-colors text-zinc-400">
                                    漢
                                </div>
                                <h2 className="text-sm uppercase tracking-widest font-medium mb-2 text-white">Kanji</h2>
                                <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                                    {kanji.length} characters
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Session Complete Screen
    if (mode === 'complete') {
        const percentage = Math.round((score.correct / score.total) * 100);
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono selection:bg-white selection:text-black">
                <Card className="max-w-xl w-full bg-zinc-900/30 border-white/10 backdrop-blur-md animate-in zoom-in-95 duration-500">
                    <CardContent className="p-12 text-center">
                        <h2 className="text-sm uppercase tracking-widest font-medium mb-12 text-zinc-500">
                            Session Complete
                        </h2>
                        <div className="mb-12">
                            <div className="text-8xl font-thin text-white mb-4">
                                {percentage}%
                            </div>
                            <p className="text-sm text-zinc-500 uppercase tracking-wider">
                                {score.correct} / {score.total} Correct
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Button
                                onClick={resetToMenu}
                                className="w-full h-12 text-sm uppercase tracking-widest bg-white text-black hover:bg-zinc-200"
                            >
                                Return
                            </Button>
                            <Button
                                onClick={() => startSession(mode)}
                                variant="outline"
                                className="w-full h-12 text-sm uppercase tracking-widest border-white/10 bg-transparent text-white hover:bg-zinc-900"
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Flashcard Study Screen
    return (
        <div className="min-h-screen bg-black text-white flex flex-col p-4 font-mono selection:bg-white selection:text-black">
            {/* Header */}
            <div className="max-w-4xl w-full mx-auto mb-6">
                <div className="flex justify-between items-center mb-6">
                    <Button
                        onClick={resetToMenu}
                        variant="ghost"
                        className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-transparent pl-0 gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Exit
                    </Button>
                    <div className="text-xs font-mono text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded border border-white/5">
                        {score.correct} / {score.total}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-zinc-600 text-[10px] uppercase tracking-wider">
                        <span>{mode}</span>
                        <span>{currentIndex + 1} / {shuffledCards.length}</span>
                    </div>
                    <Progress value={progress} className="h-[1px] bg-zinc-900 text-white [&>div]:bg-white" />
                </div>
            </div>

            {/* Flashcard */}
            <div className="flex-1 flex items-center justify-center relative">
                <div className="w-full max-w-xl relative">
                    {/* Controls */}
                    <div className="absolute -right-16 top-0 flex flex-col gap-4">
                        <Button
                            onClick={() => setIsWriting(!isWriting)}
                            variant="ghost"
                            className={`w-12 h-12 rounded-full border border-white/10 hover:bg-zinc-900 ${isWriting ? 'bg-white text-black hover:bg-zinc-200 border-white' : 'text-zinc-500'}`}
                        >
                            <PenTool className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={(e) => playAudio(e)}
                            variant="ghost"
                            className="w-12 h-12 rounded-full border border-white/10 text-zinc-500 hover:text-white hover:bg-zinc-900"
                        >
                            <Volume2 className="w-5 h-5" />
                        </Button>
                    </div>

                    <div
                        className={`cursor-pointer select-none transition-all duration-300 ${feedback === 'incorrect' ? 'translate-x-[-10px] border-red-500/50' : ''} ${feedback === 'correct' ? 'border-green-500/50' : ''}`}
                        onClick={handleFlip}
                    >
                        <Card className={`relative h-96 border bg-zinc-900/20 backdrop-blur-md overflow-hidden transition-colors duration-300 ${feedback === 'incorrect' ? 'border-red-900 bg-red-900/10' :
                            feedback === 'correct' ? 'border-green-900 bg-green-900/10' :
                                'border-white/10 hover:bg-zinc-900/30'
                            }`}>

                            <CardContent className="h-full relative p-0">
                                {isWriting ? (
                                    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-2 animate-in fade-in duration-300">
                                        {/* Top Controls */}
                                        <div className="absolute top-4 right-4 flex gap-4 z-50">
                                            <Button
                                                onClick={() => setGridVersion(v => v + 1)}
                                                variant="outline"
                                                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Clear All
                                            </Button>
                                            <Button
                                                onClick={() => setIsWriting(false)}
                                                variant="ghost"
                                                className="text-zinc-500 hover:text-white hover:bg-zinc-800"
                                            >
                                                <XCircle className="w-8 h-8" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-5 gap-2 md:gap-4 w-full max-w-[98vw] mx-auto">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className="relative aspect-square w-full border-2 border-zinc-700 bg-zinc-900 rounded-sm overflow-hidden flex items-center justify-center">
                                                    {/* Grid Lines */}
                                                    <div className="absolute inset-0 pointer-events-none z-0">
                                                        <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-zinc-700"></div>
                                                        <div className="absolute left-1/2 top-0 h-full border-l-2 border-dashed border-zinc-700"></div>
                                                    </div>

                                                    {/* Guide Character - Only for first cell */}
                                                    {i === 0 && (
                                                        <div className="z-0 flex items-center justify-center w-full h-full text-white pointer-events-none select-none">
                                                            <span className="text-[min(12vw,12vh)] leading-none font-bold">
                                                                {currentCard?.char}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Canvas Layer */}
                                                    <div className="absolute inset-0 z-10">
                                                        <DrawingCanvas
                                                            key={`${currentCard?.char}-${i}-${gridVersion}`}
                                                            className="w-full h-full bg-transparent"
                                                            showControls={false}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Romanization Display */}
                                        <div className="mt-8 text-zinc-400 font-mono text-xl tracking-[0.5em] pointer-events-none select-none uppercase animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            {currentCard?.romaji}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-12 relative z-10">
                                        {!showAnswer ? (
                                            // Front of card
                                            <div className="text-center animate-in fade-in duration-300">
                                                <div className="text-9xl font-thin mb-8 text-white">
                                                    {currentCard?.char}
                                                </div>
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                                                    Tap to reveal
                                                </p>
                                            </div>
                                        ) : (
                                            // Back of card
                                            <div className="text-center animate-in fade-in duration-300">
                                                <div className="text-4xl font-light mb-4 text-white">
                                                    {currentCard?.romaji}
                                                </div>
                                                {currentCard?.meaning && (
                                                    <div className="text-lg text-zinc-400 mb-8 font-light">
                                                        {currentCard.meaning}
                                                    </div>
                                                )}
                                                <div className="text-6xl mb-8 text-zinc-800 font-thin">
                                                    {currentCard?.char}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Answer Buttons */}
                    <div className={`grid grid-cols-2 gap-4 mt-8 transition-all duration-300 ${showAnswer && !feedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <Button
                            onClick={(e) => { e.stopPropagation(); handleAnswer(false); }}
                            className="h-14 bg-transparent border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900 hover:bg-red-900/10 uppercase tracking-widest text-xs gap-2"
                            disabled={!showAnswer || !!feedback}
                        >
                            <XCircle className="w-4 h-4" />
                            Miss
                        </Button>
                        <Button
                            onClick={(e) => { e.stopPropagation(); handleAnswer(true); }}
                            className="h-14 bg-white text-black hover:bg-zinc-200 border border-white uppercase tracking-widest text-xs gap-2"
                            disabled={!showAnswer || !!feedback}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Got it
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
}
