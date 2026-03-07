import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Linkedin, 
  Instagram, 
  MessageSquare, 
  Pin, 
  Send, 
  Loader2, 
  Image as ImageIcon, 
  RefreshCw,
  Copy,
  Check,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { generateSocialContent, generatePlatformImage, GenerationResult, SocialContent } from './services/gemini';
import { cn } from './lib/utils';

// Extend window for AI Studio API
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const TONES = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'witty', label: 'Witty', icon: '🎭' },
  { id: 'urgent', label: 'Urgent', icon: '🚨' },
  { id: 'inspirational', label: 'Inspirational', icon: '✨' },
];

const SIZES = ['1K', '2K', '4K'] as const;

export default function App() {
  const [idea, setIdea] = useState('');
  const [businessInfo, setBusinessInfo] = useState('');
  const [tone, setTone] = useState('professional');
  const [size, setSize] = useState<"1K" | "2K" | "4K">('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [hasApiKey, setHasApiKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    }
  };

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setResults(null);
    setImages({});
    
    try {
      const fullPrompt = `Idea: ${idea}${businessInfo ? `\nBusiness Context: ${businessInfo}` : ''}`;
      const content = await generateSocialContent(fullPrompt, tone);
      setResults(content);
      
      // Auto-generate images for each platform
      const platforms = ['linkedin', 'threads', 'instagram', 'pinterest'] as const;
      platforms.forEach(p => handleGenerateImage(p, content[p]));
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (platform: string, content: SocialContent) => {
    setGeneratingImages(prev => ({ ...prev, [platform]: true }));
    try {
      const imageUrl = await generatePlatformImage(content.imagePrompt, content.aspectRatio, size);
      setImages(prev => ({ ...prev, [platform]: imageUrl }));
    } catch (error: any) {
      console.error(`Image generation failed for ${platform}:`, error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        // Optionally alert the user
      }
    } finally {
      setGeneratingImages(prev => ({ ...prev, [platform]: false }));
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">SocialSync AI</span>
          </div>
          
          {!hasApiKey && (
            <button 
              onClick={handleOpenKeyDialog}
              className="text-xs font-medium uppercase tracking-wider px-4 py-2 bg-amber-100 text-amber-800 rounded-full flex items-center gap-2 hover:bg-amber-200 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Setup Image API Key
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[400px_1fr] gap-12">
          {/* Controls Sidebar */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#5A5A40]">The Idea</h2>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="What's your content idea? (e.g., 'A new sustainable coffee brand launching in Brooklyn')"
                className="w-full h-32 p-4 bg-white border border-black/5 rounded-2xl focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all resize-none shadow-sm"
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#5A5A40]">Business Context</h2>
              <textarea
                value={businessInfo}
                onChange={(e) => setBusinessInfo(e.target.value)}
                placeholder="Any specific business details, target audience, or brand guidelines?"
                className="w-full h-24 p-4 bg-white border border-black/5 rounded-2xl focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all resize-none shadow-sm"
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#5A5A40]">Tone of Voice</h2>
              <div className="grid grid-cols-2 gap-3">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium",
                      tone === t.id 
                        ? "bg-[#5A5A40] border-[#5A5A40] text-white shadow-md" 
                        : "bg-white border-black/5 hover:border-[#5A5A40]/30"
                    )}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-[#5A5A40]">Image Quality</h2>
                <Settings2 className="w-4 h-4 text-[#5A5A40]/50" />
              </div>
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-xs font-bold transition-all",
                      size === s 
                        ? "bg-black text-white border-black" 
                        : "bg-white border-black/5 hover:bg-black/5"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !idea.trim()}
              className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-[#4A4A35] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#5A5A40]/20"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {isGenerating ? 'Drafting Content...' : 'Generate Campaign'}
            </button>
          </div>

          {/* Results Area */}
          <div className="space-y-12">
            {!results && !isGenerating && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-black/5 rounded-[40px]">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                  <Sparkles className="w-10 h-10 text-[#5A5A40]/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif italic text-[#5A5A40]">Ready to create?</h3>
                  <p className="text-black/40 max-w-xs">Enter an idea and choose a tone to generate your cross-platform strategy.</p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="space-y-8 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-[32px] p-8 h-96 border border-black/5" />
                ))}
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {results && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-8"
                >
                  <PlatformCard 
                    platform="LinkedIn" 
                    icon={<Linkedin className="w-5 h-5" />}
                    content={results.linkedin}
                    image={images.linkedin}
                    isGeneratingImage={generatingImages.linkedin}
                    onRegenerateImage={() => handleGenerateImage('linkedin', results.linkedin)}
                    onCopy={() => copyToClipboard(results.linkedin.text, 'linkedin')}
                    isCopied={copied === 'linkedin'}
                  />
                  <PlatformCard 
                    platform="Threads" 
                    icon={<MessageSquare className="w-5 h-5" />}
                    content={results.threads}
                    image={images.threads}
                    isGeneratingImage={generatingImages.threads}
                    onRegenerateImage={() => handleGenerateImage('threads', results.threads)}
                    onCopy={() => copyToClipboard(results.threads.text, 'threads')}
                    isCopied={copied === 'threads'}
                  />
                  <PlatformCard 
                    platform="Instagram" 
                    icon={<Instagram className="w-5 h-5" />}
                    content={results.instagram}
                    image={images.instagram}
                    isGeneratingImage={generatingImages.instagram}
                    onRegenerateImage={() => handleGenerateImage('instagram', results.instagram)}
                    onCopy={() => copyToClipboard(results.instagram.text, 'instagram')}
                    isCopied={copied === 'instagram'}
                  />
                  <PlatformCard 
                    platform="Pinterest" 
                    icon={<Pin className="w-5 h-5" />}
                    content={results.pinterest}
                    image={images.pinterest}
                    isGeneratingImage={generatingImages.pinterest}
                    onRegenerateImage={() => handleGenerateImage('pinterest', results.pinterest)}
                    onCopy={() => copyToClipboard(results.pinterest.text, 'pinterest')}
                    isCopied={copied === 'pinterest'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlatformCard({ 
  platform, 
  icon, 
  content, 
  image, 
  isGeneratingImage, 
  onRegenerateImage,
  onCopy,
  isCopied
}: { 
  platform: string; 
  icon: React.ReactNode; 
  content: SocialContent;
  image?: string;
  isGeneratingImage: boolean;
  onRegenerateImage: () => void;
  onCopy: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="bg-white rounded-[32px] border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-8 flex flex-col md:grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center text-[#5A5A40]">
                {icon}
              </div>
              <h3 className="font-bold text-xl">{platform}</h3>
            </div>
            <button 
              onClick={onCopy}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors text-[#5A5A40]"
            >
              {isCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="prose prose-sm max-w-none text-black/70 leading-relaxed whitespace-pre-wrap font-sans">
            {content.text}
          </div>

          <div className="pt-4 border-t border-black/5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]/40 mb-2">Image Prompt</p>
            <p className="text-xs italic text-[#5A5A40]/60">{content.imagePrompt}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div 
            className={cn(
              "relative rounded-2xl overflow-hidden bg-[#F5F5F0] border border-black/5 flex items-center justify-center",
              content.aspectRatio === '9:16' ? 'aspect-[9/16]' : 
              content.aspectRatio === '3:4' ? 'aspect-[3/4]' : 
              content.aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-square'
            )}
          >
            {isGeneratingImage ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#5A5A40]/30" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-[#5A5A40]/30">Generating...</span>
              </div>
            ) : image ? (
              <img 
                src={image} 
                alt={`${platform} visual`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-[#5A5A40]/10" />
            )}
            
            {image && !isGeneratingImage && (
              <button 
                onClick={onRegenerateImage}
                className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur shadow-sm rounded-full hover:bg-white transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-[#5A5A40]" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40]/40">Ratio: {content.aspectRatio}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
