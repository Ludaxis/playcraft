import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { Logo } from '../components';
import {
  Gamepad2,
  Zap,
  Users,
  Target,
  TrendingUp,
  Shield,
  DollarSign,
  Rocket,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Sparkles,
  Clock,
  Code,
  Play,
  BarChart3,
  Globe,
  Building2,
  MessageSquare,
  Printer,
  Mail,
  Linkedin,
} from 'lucide-react';

// Slide data configuration (Arabic labels)
const SLIDES = [
  { id: 'title', label: 'العنوان' },
  { id: 'problem', label: 'المشكلة' },
  { id: 'solution', label: 'الحل' },
  { id: 'why-now', label: 'لماذا الآن' },
  { id: 'product', label: 'المنتج' },
  { id: 'moat', label: 'الميزة' },
  { id: 'competition', label: 'المنافسة' },
  { id: 'business-model', label: 'نموذج العمل' },
  { id: 'traction', label: 'الجذب' },
  { id: 'go-to-market', label: 'GTM' },
  { id: 'team', label: 'الفريق' },
  { id: 'ask', label: 'الطلب' },
  { id: 'thank-you', label: 'شكراً' },
];

// Competitor data
const COMPETITORS = [
  { name: 'Lovable', focus: 'تطبيقات ويب', gaming: 'محدود', color: '#ec4899' },
  { name: 'Bolt.new', focus: 'فول ستاك', gaming: 'محدود', color: '#3b82f6' },
  { name: 'Replit', focus: 'IDE + AI', gaming: 'متوسط', color: '#f59e0b' },
  { name: 'Base44', focus: 'تطبيقات أعمال', gaming: 'محدود جداً', color: '#8b5cf6' },
];

export function PitchArPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimating = useRef(false);

  // Navigate to a specific slide with GSAP animation
  const goToSlide = useCallback((index: number) => {
    if (isAnimating.current || index === currentSlide || index < 0 || index >= SLIDES.length) {
      return;
    }

    isAnimating.current = true;
    const currentEl = slideRefs.current[currentSlide];
    const nextEl = slideRefs.current[index];

    if (!currentEl || !nextEl) {
      isAnimating.current = false;
      return;
    }

    gsap.killTweensOf(currentEl);
    gsap.killTweensOf(nextEl);

    gsap.set(nextEl, { opacity: 0, display: 'flex' });

    gsap.to(currentEl, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(currentEl, { display: 'none' });
      },
    });

    gsap.to(nextEl, {
      opacity: 1,
      duration: 0.4,
      delay: 0.15,
      ease: 'power2.out',
      onComplete: () => {
        setCurrentSlide(index);
        isAnimating.current = false;
      },
    });
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // RTL: swap arrow keys
      if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowRight' || e.key === 'Backspace') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        window.history.back();
      } else if (e.key >= '1' && e.key <= '9') {
        const slideIndex = parseInt(e.key) - 1;
        if (slideIndex < SLIDES.length) {
          goToSlide(slideIndex);
        }
      } else if (e.key === '0') {
        goToSlide(9);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  // Initial animation for first slide
  useEffect(() => {
    const firstSlide = slideRefs.current[0];
    if (firstSlide) {
      gsap.set(firstSlide, { display: 'flex', opacity: 0 });
      gsap.to(firstSlide, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="pitch-deck fixed inset-0 overflow-hidden print:relative print:h-auto"
      style={{
        fontFamily: "'Vazirmatn', sans-serif",
        background: `
          radial-gradient(ellipse 80% 60% at 50% 100%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 20% 20%, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(255, 0, 229, 0.08) 0%, transparent 50%),
          var(--surface-base)
        `,
      }}
    >
      {/* Progress Bar */}
      <div className="pitch-nav fixed top-0 left-0 right-0 h-1 bg-surface-elevated z-50 print:hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${((currentSlide + 1) / SLIDES.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent-default), var(--secondary-default))',
            marginRight: 'auto',
            marginLeft: 0,
          }}
        />
      </div>

      {/* Navigation Arrows - RTL swapped */}
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className={`pitch-nav fixed right-6 top-1/2 -translate-y-1/2 p-3 rounded-full border border-border-muted bg-surface-elevated/50 backdrop-blur-sm transition-all z-50 hidden lg:flex print:hidden ${
          currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-raised hover:border-accent'
        }`}
      >
        <ChevronRight className="w-6 h-6 text-content-secondary" />
      </button>
      <button
        onClick={nextSlide}
        disabled={currentSlide === SLIDES.length - 1}
        className={`pitch-nav fixed left-6 top-1/2 -translate-y-1/2 p-3 rounded-full border border-border-muted bg-surface-elevated/50 backdrop-blur-sm transition-all z-50 hidden lg:flex print:hidden ${
          currentSlide === SLIDES.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-raised hover:border-accent'
        }`}
      >
        <ChevronLeft className="w-6 h-6 text-content-secondary" />
      </button>

      {/* Mobile/Tablet: bottom navigation */}
      <div className="pitch-nav fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 lg:hidden print:hidden">
        <button
          onClick={nextSlide}
          disabled={currentSlide === SLIDES.length - 1}
          className={`p-2 rounded-full border border-border-muted bg-surface-elevated/80 backdrop-blur-sm transition-all ${
            currentSlide === SLIDES.length - 1 ? 'opacity-30 cursor-not-allowed' : 'active:bg-surface-raised'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-content-secondary" />
        </button>
        <span className="text-content-tertiary text-xs font-mono min-w-[3rem] text-center" dir="ltr">
          {currentSlide + 1} / {SLIDES.length}
        </span>
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`p-2 rounded-full border border-border-muted bg-surface-elevated/80 backdrop-blur-sm transition-all ${
            currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'active:bg-surface-raised'
          }`}
        >
          <ChevronRight className="w-5 h-5 text-content-secondary" />
        </button>
      </div>

      {/* Slide Counter + Print Button */}
      <div className="pitch-nav fixed top-6 left-6 flex items-center gap-4 z-50 hidden lg:flex print:hidden">
        <span className="text-content-tertiary text-sm font-mono" dir="ltr">
          {String(currentSlide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </span>
        <button
          onClick={() => window.print()}
          className="p-2 rounded-lg border border-border-muted bg-surface-elevated/50 backdrop-blur-sm hover:bg-surface-raised hover:border-accent transition-all"
          title="خروجی PDF"
        >
          <Printer className="w-4 h-4 text-content-secondary" />
        </button>
      </div>

      {/* Slides Container */}
      <div className="w-full h-full">
        {/* Slide 1: Title */}
        <div
          ref={(el) => { slideRefs.current[0] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-8"
          style={{ display: 'none' }}
        >
          <div>
            <Logo size={48} showText={false} className="md:hidden" />
            <Logo size={64} showText={false} className="hidden md:block" />
          </div>
          <h1 className="text-4xl md:text-8xl font-bold text-content-primary mt-4 md:mt-8 tracking-tight">
            PlayCraft
          </h1>
          <p className="text-sm md:text-2xl text-content-secondary mt-3 md:mt-6 font-light text-center px-4 max-w-3xl">
            استوديو ألعاب بالذكاء الاصطناعي — ابنِ، انشر، واربح
          </p>
          <div className="mt-6 md:mt-10 flex items-center gap-2 text-content-tertiary">
            <span className="text-xs md:text-sm">Pre-seed Round</span>
            <span className="text-accent">•</span>
            <span className="text-xs md:text-sm" dir="ltr">$500K</span>
          </div>
          <div className="mt-6 md:mt-12 text-content-tertiary text-xs md:text-sm flex items-center gap-1 md:gap-2 print:hidden">
            <span>للمتابعة اضغط</span>
            <kbd className="px-1.5 md:px-2 py-0.5 md:py-1 bg-surface-elevated rounded border border-border-muted text-xs" dir="ltr">←</kbd>
            <span>أو</span>
            <kbd className="px-1.5 md:px-2 py-0.5 md:py-1 bg-surface-elevated rounded border border-border-muted text-xs">Space</kbd>
          </div>
        </div>

        {/* Slide 2: Problem */}
        <div
          ref={(el) => { slideRefs.current[1] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-4 md:mb-12">
            صناعة الألعاب <span className="text-error">صعبة</span>
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-5xl px-2">
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Clock className="w-6 h-6 md:w-12 md:h-12 text-error mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2" dir="ltr">6-12</p>
              <p className="text-content-secondary text-xs md:text-base">شهر لتعلم Unity/Unreal</p>
            </div>
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Users className="w-6 h-6 md:w-12 md:h-12 text-warning mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2" dir="ltr">3.2B</p>
              <p className="text-content-secondary text-xs md:text-base">لاعب، فقط مليون مطور</p>
            </div>
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Target className="w-6 h-6 md:w-12 md:h-12 text-magenta-400 mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2" dir="ltr">95%</p>
              <p className="text-content-secondary text-xs md:text-base">من الأفكار لا تُبنى أبداً</p>
            </div>
          </div>
          <p className="mt-4 md:mt-12 text-sm md:text-xl text-content-tertiary max-w-2xl text-center px-4">
            الفجوة بين الخيال واللعبة القابلة للنشر كبيرة جداً.
          </p>
        </div>

        {/* Slide 3: Solution */}
        <div
          ref={(el) => { slideRefs.current[2] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4 text-center">
            ابنِ. استضف. <span className="text-accent">اربح.</span>
          </h2>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-10 text-center px-4">
            منصة ألعاب متكاملة — من البرومبت إلى الربح
          </p>
          <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-4xl mb-4 md:mb-8 px-2">
            <div className="bg-surface-elevated border border-accent/30 rounded-xl md:rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <Code className="w-5 h-5 md:w-7 md:h-7 text-accent" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-1">البناء</h3>
              <p className="text-content-tertiary text-xs md:text-sm hidden md:block">تولید کد با AI، پیش‌نمایش زنده</p>
              <p className="text-content-tertiary text-xs md:hidden">AI + پیش‌نمایش</p>
            </div>
            <div className="bg-surface-elevated border border-secondary/30 rounded-xl md:rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <Globe className="w-5 h-5 md:w-7 md:h-7 text-secondary" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-1">التشغيل</h3>
              <p className="text-content-tertiary text-xs md:text-sm hidden md:block">چندنفره، لیدربورد، آنالیتیکس</p>
              <p className="text-content-tertiary text-xs md:hidden">چندنفره + API</p>
            </div>
            <div className="bg-surface-elevated border border-warning/30 rounded-xl md:rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-warning/20 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <DollarSign className="w-5 h-5 md:w-7 md:h-7 text-warning" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-1">الربح</h3>
              <p className="text-content-tertiary text-xs md:text-sm hidden md:block">تبلیغات، خرید درون‌برنامه‌ای، تقسیم درآمد</p>
              <p className="text-content-tertiary text-xs md:hidden">تبلیغ + IAP</p>
            </div>
          </div>
          <div className="bg-surface-elevated/80 border border-accent/30 rounded-xl px-4 md:px-6 py-2 md:py-3 text-center">
            <p className="text-accent font-medium text-sm md:text-base">«اگه هاست کنی، کمکت می‌کنیم درآمد داشته باشی»</p>
          </div>
        </div>

        {/* Slide 4: Why Now */}
        <div
          ref={(el) => { slideRefs.current[3] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-4 md:mb-12">
            لماذا <span className="text-accent">الآن</span>؟
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-5xl mb-4 md:mb-12 px-2">
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-6">
              <Sparkles className="w-5 h-5 md:w-10 md:h-10 text-accent mb-2 md:mb-4" />
              <h3 className="text-xs md:text-xl font-semibold text-content-primary mb-1 md:mb-2">توانایی AI</h3>
              <p className="text-content-secondary text-xs md:text-base hidden md:block">LLM کدنویسی در ۲۰۲۴-۲۰۲۵ به سطح قابل اعتماد رسید</p>
              <p className="text-content-secondary text-xs md:hidden">آستانه قابلیت AI</p>
            </div>
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-6">
              <TrendingUp className="w-5 h-5 md:w-10 md:h-10 text-success mb-2 md:mb-4" />
              <h3 className="text-xs md:text-xl font-semibold text-content-primary mb-1 md:mb-2">اعتبارسنجی بازار</h3>
              <p className="text-content-secondary text-xs md:text-base hidden md:block">ابزارهای «وایب کدینگ» در کمتر از ۱۲ ماه به +$100M ARR رسیدند</p>
              <p className="text-content-secondary text-xs md:hidden" dir="ltr">+$100M ARR</p>
            </div>
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-6">
              <Users className="w-5 h-5 md:w-10 md:h-10 text-secondary mb-2 md:mb-4" />
              <h3 className="text-xs md:text-xl font-semibold text-content-primary mb-1 md:mb-2">تقاضای سازندگان</h3>
              <p className="text-content-secondary text-xs md:text-base hidden md:block">کریتورهای تیک‌تاک/یوتیوب نیاز به محتوای گیمیفای دارند</p>
              <p className="text-content-secondary text-xs md:hidden">اکونومی کریتور</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-8 bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl px-3 md:px-8 py-3 md:py-6">
            <div className="text-center">
              <p className="text-lg md:text-3xl font-bold text-content-primary" dir="ltr">$3.9B</p>
              <p className="text-content-tertiary text-xs md:text-sm">۲۰۲۴</p>
            </div>
            <ArrowLeft className="w-4 h-4 md:w-8 md:h-8 text-accent" />
            <div className="text-center">
              <p className="text-lg md:text-3xl font-bold text-accent" dir="ltr">$37B</p>
              <p className="text-content-tertiary text-xs md:text-sm">۲۰۳۲</p>
            </div>
            <div className="text-content-secondary text-xs md:text-sm mr-2 md:mr-4">
              بازار AI App Builder<br />
              <span className="text-success" dir="ltr">32.5% CAGR</span>
            </div>
          </div>
        </div>

        {/* Slide 5: Product */}
        <div
          ref={(el) => { slideRefs.current[4] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-4 md:mb-8">
            المنتج
          </h2>
          <div className="w-full max-w-5xl bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-2 md:p-4 mb-4 md:mb-8 mx-2">
            <div className="aspect-video bg-surface-raised rounded-lg md:rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Gamepad2 className="w-8 h-8 md:w-16 md:h-16 text-accent mx-auto mb-2 md:mb-4" />
                <p className="text-content-secondary text-xs md:text-base">دمو / اسکرین‌شات</p>
                <p className="text-content-tertiary text-xs mt-1 md:mt-2 hidden md:block">چت + ویرایشگر کد + پیش‌نمایش زنده</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-4xl px-2">
            <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2 md:p-4 text-center">
              <Code className="w-5 h-5 md:w-8 md:h-8 text-accent mx-auto mb-1 md:mb-2" />
              <p className="text-content-primary text-xs md:text-sm font-medium">تولید کد AI</p>
            </div>
            <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2 md:p-4 text-center">
              <Play className="w-5 h-5 md:w-8 md:h-8 text-success mx-auto mb-1 md:mb-2" />
              <p className="text-content-primary text-xs md:text-sm font-medium">پیش‌نمایش زنده</p>
            </div>
            <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2 md:p-4 text-center">
              <Gamepad2 className="w-5 h-5 md:w-8 md:h-8 text-secondary mx-auto mb-1 md:mb-2" />
              <p className="text-content-primary text-xs md:text-sm font-medium">+۱۰ قالب</p>
            </div>
            <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2 md:p-4 text-center">
              <Rocket className="w-5 h-5 md:w-8 md:h-8 text-warning mx-auto mb-1 md:mb-2" />
              <p className="text-content-primary text-xs md:text-sm font-medium">انتشار ۱ کلیک</p>
            </div>
          </div>
        </div>

        {/* Slide 6: Why We Win (Moat) */}
        <div
          ref={(el) => { slideRefs.current[5] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4 text-center">
            لماذا ما <span className="text-accent">برنده می‌شویم</span>
          </h2>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-8 text-center">
            مزیت‌های ترکیبی که رقبا نمی‌توانند کپی کنند
          </p>
          <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-4xl px-2">
            <div className="bg-surface-elevated border border-accent/30 rounded-lg md:rounded-xl p-2.5 md:p-5">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 md:w-5 md:h-5 text-accent" />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-content-primary">عمق عمودی</h3>
              </div>
              <p className="text-content-secondary text-xs md:text-sm hidden md:block">پرامپت‌های گیمینگ، کتابخانه مکانیک‌ها، چندنفره پیش‌فرض</p>
              <p className="text-content-secondary text-xs md:hidden">AI بومی گیمینگ</p>
            </div>
            <div className="bg-surface-elevated border border-secondary/30 rounded-lg md:rounded-xl p-2.5 md:p-5">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-secondary" />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-content-primary">چرخه داده</h3>
              </div>
              <p className="text-content-secondary text-xs md:text-sm hidden md:block">تلمتری ساخت + التشغيل → تولید بهتر، دیباگ خودکار</p>
              <p className="text-content-secondary text-xs md:hidden">AI خودبهبود</p>
            </div>
            <div className="bg-surface-elevated border border-success/30 rounded-lg md:rounded-xl p-2.5 md:p-5">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-success/20 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 md:w-5 md:h-5 text-success" />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-content-primary">قفل پلتفرم</h3>
              </div>
              <p className="text-content-secondary text-xs md:text-sm hidden md:block">سازندگانی که درآمد دارند ۳ برابر بیشتر می‌مانند</p>
              <p className="text-content-secondary text-xs md:hidden">چسبندگی الربح</p>
            </div>
            <div className="bg-surface-elevated border border-warning/30 rounded-lg md:rounded-xl p-2.5 md:p-5">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-warning/20 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 md:w-5 md:h-5 text-warning" />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-content-primary">قدرت قیمت‌گذاری</h3>
              </div>
              <p className="text-content-secondary text-xs md:text-sm hidden md:block">سیستم دو-اعتباری هزینه را با ارزش تنظیم می‌کند</p>
              <p className="text-content-secondary text-xs md:hidden">تنظیم هزینه منصفانه</p>
            </div>
          </div>
          <p className="mt-3 md:mt-6 text-content-tertiary text-center max-w-2xl text-xs md:text-sm px-4">
            گیمینگ حدود ۵٪ کاربران البناء‌های افقی است — ارزش سرمایه‌گذاری برای رقابت را ندارد.
          </p>
        </div>

        {/* Slide 7: Competition */}
        <div
          ref={(el) => { slideRefs.current[6] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center px-4 md:px-8 py-8 md:py-20"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-4xl font-bold text-content-primary mb-4 md:mb-8">
            رقبا
          </h2>

          {/* Mobile: Simplified vertical list */}
          <div className="w-full max-w-xs md:hidden px-4">
            <div className="space-y-3">
              <div className="bg-accent/20 border border-accent rounded-xl p-3 text-center">
                <div className="px-4 py-2 rounded-lg bg-accent text-white font-bold inline-block mb-2">
                  PlayCraft
                </div>
                <p className="text-xs text-content-secondary">بدون کد + البناء بازی</p>
                <p className="text-xs text-accent mt-1">تنها بازیکن این فضا</p>
              </div>

              <div className="bg-surface-elevated border border-border-muted rounded-xl p-3">
                <p className="text-xs text-content-tertiary mb-2 text-center">البناء‌های اپ بدون کد</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {COMPETITORS.map((c) => (
                    <span
                      key={c.name}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: c.color + '25', color: c.color }}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-surface-elevated/50 border border-border-muted rounded-xl p-3">
                <p className="text-xs text-content-tertiary mb-2 text-center">ابزارهای کد-محور</p>
                <div className="flex justify-center gap-3 text-xs text-content-tertiary/60">
                  <span>Unity</span>
                  <span>•</span>
                  <span>Godot</span>
                  <span>•</span>
                  <span>VS Code</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: 2x2 Matrix */}
          <div className="w-full max-w-2xl hidden md:block">
            <div className="relative">
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col items-center text-xs text-content-tertiary">
                <span>کد-محور</span>
                <div className="w-px h-16 bg-content-tertiary/30 my-2" />
                <span>بدون کد</span>
              </div>

              <div className="bg-surface-elevated rounded-xl overflow-hidden h-[280px]">
                <div className="grid grid-cols-2 grid-rows-2 h-full">
                  <div className="flex items-center justify-center border-l border-b border-content-tertiary/20 p-4">
                    <span className="text-content-tertiary/40 text-sm">VS Code + Cursor</span>
                  </div>
                  <div className="flex items-center justify-center border-b border-content-tertiary/20 p-4">
                    <span className="text-content-tertiary/40 text-sm">Unity / Godot</span>
                  </div>
                  <div className="flex items-center justify-center border-l border-content-tertiary/20 p-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {COMPETITORS.map((c) => (
                        <span
                          key={c.name}
                          className="px-3 py-1.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: c.color + '25', color: c.color }}
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center p-4">
                    <div className="px-6 py-3 rounded-xl bg-accent text-white font-bold shadow-glow">
                      PlayCraft
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-content-tertiary">
                <span>البناء اپ</span>
                <div className="w-20 h-px bg-content-tertiary/30" />
                <span>البناء بازی</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 8: Business Model */}
        <div
          ref={(el) => { slideRefs.current[7] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4">
            مدل درآمد
          </h2>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-8 text-center">
            SaaS + تقسیم درآمد پلتفرم (مدل روبلاکس)
          </p>
          <div className="grid grid-cols-2 gap-2 md:gap-6 max-w-3xl mb-4 md:mb-8 px-2">
            <div className="bg-surface-elevated border border-accent/30 rounded-lg md:rounded-xl p-3 md:p-5">
              <h3 className="text-xs md:text-lg font-semibold text-accent mb-2 md:mb-3">درآمد SaaS</h3>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-secondary">
                <p className="flex items-center gap-1.5"><Code className="w-3 h-3 md:w-4 md:h-4 text-accent" /> اعتبار ساخت</p>
                <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 md:w-4 md:h-4 text-accent" /> اعتبار التشغيل</p>
                <p className="flex items-center gap-1.5"><Users className="w-3 h-3 md:w-4 md:h-4 text-accent" /> اشتراک الفريقی</p>
              </div>
            </div>
            <div className="bg-surface-elevated border border-warning/30 rounded-lg md:rounded-xl p-3 md:p-5">
              <h3 className="text-xs md:text-lg font-semibold text-warning mb-2 md:mb-3">درآمد پلتفرم</h3>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-secondary">
                <p className="flex items-center gap-1.5"><BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-warning" /> ۲۰-۳۰٪ سهم تبلیغات</p>
                <p className="flex items-center gap-1.5"><DollarSign className="w-3 h-3 md:w-4 md:h-4 text-warning" /> ۲۰-۳۰٪ سهم IAP</p>
                <p className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 md:w-4 md:h-4 text-warning" /> کمیسیون مارکت‌پلیس</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-center mb-3 md:mb-6">
            <div className="bg-surface-elevated border border-border-muted rounded-lg px-2.5 md:px-5 py-1.5 md:py-3">
              <p className="text-base md:text-xl font-bold text-success" dir="ltr">70-80%</p>
              <p className="text-content-tertiary text-xs">حاشیه سود ناخالص</p>
            </div>
            <div className="bg-surface-elevated border border-border-muted rounded-lg px-2.5 md:px-5 py-1.5 md:py-3">
              <p className="text-base md:text-xl font-bold text-accent" dir="ltr">{">"}5:1</p>
              <p className="text-content-tertiary text-xs">LTV:CAC</p>
            </div>
            <div className="bg-surface-elevated border border-border-muted rounded-lg px-2.5 md:px-5 py-1.5 md:py-3">
              <p className="text-base md:text-xl font-bold text-secondary" dir="ltr">{"<"}3mo</p>
              <p className="text-content-tertiary text-xs">بازگشت سرمایه</p>
            </div>
          </div>
          <p className="text-content-tertiary text-xs md:text-sm text-center">
            بازی بیشتر ← التشغيلی بیشتر ← درآمد بیشتر ← رشد ترکیبی
          </p>
        </div>

        {/* Slide 9: Traction */}
        <div
          ref={(el) => { slideRefs.current[8] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4">
            ترکشن
          </h2>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-12">
            قبل از لانچ — ساخت عمومی
          </p>
          <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-4xl mb-4 md:mb-12 px-2">
            <div className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Rocket className="w-6 h-6 md:w-12 md:h-12 text-accent mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">MVP</p>
              <p className="text-content-secondary text-xs md:text-base">المنتج فعال ساخته شد</p>
            </div>
            <div className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Gamepad2 className="w-6 h-6 md:w-12 md:h-12 text-secondary mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2" dir="ltr">10+</p>
              <p className="text-content-secondary text-xs md:text-base">قالب بازی آماده</p>
            </div>
            <div className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Users className="w-6 h-6 md:w-12 md:h-12 text-success mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">—</p>
              <p className="text-content-secondary text-xs md:text-base">لیست انتظار (به‌زودی)</p>
            </div>
          </div>
          <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-3 md:p-6 max-w-2xl text-center mx-4">
            <p className="text-content-tertiary italic text-xs md:text-base">
              «نظرات کاربران اولیه و متریک‌ها به محض جمع‌آوری اضافه می‌شوند.»
            </p>
          </div>
        </div>

        {/* Slide 10: Go-to-Market */}
        <div
          ref={(el) => { slideRefs.current[9] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-4 md:mb-12">
            استراتژی ورود به بازار
          </h2>
          <div className="flex flex-row items-stretch gap-2 md:gap-8 max-w-5xl px-2">
            <div className="flex-1 bg-surface-elevated border border-accent/30 rounded-lg md:rounded-2xl p-2 md:p-6">
              <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xs md:text-base">۱</div>
                <h3 className="text-xs md:text-xl font-semibold text-content-primary">استودیوها</h3>
              </div>
              <p className="text-content-secondary mb-2 md:mb-4 text-xs md:text-base">۰-۴ ماه</p>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-tertiary">
                <p className="flex items-center gap-1 md:gap-2"><Building2 className="w-3 h-3 md:w-4 md:h-4" /> مشارکت با پابلیشرها</p>
                <p className="flex items-center gap-1 md:gap-2"><Zap className="w-3 h-3 md:w-4 md:h-4" /> نمونه‌سازی سریع</p>
                <p className="flex items-center gap-1 md:gap-2"><Target className="w-3 h-3 md:w-4 md:h-4" /> ۳-۵ شریک طراحی</p>
              </div>
            </div>
            <div className="flex-1 bg-surface-elevated border border-secondary/30 rounded-lg md:rounded-2xl p-2 md:p-6">
              <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xs md:text-base">۲</div>
                <h3 className="text-xs md:text-xl font-semibold text-content-primary">توسعه‌دهندگان</h3>
              </div>
              <p className="text-content-secondary mb-2 md:mb-4 text-xs md:text-base">۴-۸ ماه</p>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-tertiary">
                <p className="flex items-center gap-1 md:gap-2"><Users className="w-3 h-3 md:w-4 md:h-4" /> ایندی‌دوها + مادرها</p>
                <p className="flex items-center gap-1 md:gap-2"><MessageSquare className="w-3 h-3 md:w-4 md:h-4" /> رشد کامیونیتی</p>
                <p className="flex items-center gap-1 md:gap-2"><Sparkles className="w-3 h-3 md:w-4 md:h-4" /> کیس‌استادی استودیو</p>
              </div>
            </div>
            <div className="flex-1 bg-surface-elevated border border-warning/30 rounded-lg md:rounded-2xl p-2 md:p-6">
              <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-warning flex items-center justify-center text-white font-bold text-xs md:text-base">۳</div>
                <h3 className="text-xs md:text-xl font-semibold text-content-primary">الربح</h3>
              </div>
              <p className="text-content-secondary mb-2 md:mb-4 text-xs md:text-base">۸-۱۲ ماه</p>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-tertiary">
                <p className="flex items-center gap-1 md:gap-2"><Globe className="w-3 h-3 md:w-4 md:h-4" /> لانچ پورتال بازی</p>
                <p className="flex items-center gap-1 md:gap-2"><DollarSign className="w-3 h-3 md:w-4 md:h-4" /> تقسیم تبلیغ + IAP</p>
                <p className="flex items-center gap-1 md:gap-2"><TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> پرداخت به سازندگان</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 11: Team */}
        <div
          ref={(el) => { slideRefs.current[10] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-12"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-3 md:mb-8">
            الفريق
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-4xl mb-3 md:mb-8 px-2">
            {/* Reza Hassanzadeh - Product Lead */}
            <a
              href="https://www.linkedin.com/in/reza-h/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-2 md:p-6 text-center hover:border-accent/50 transition-colors group"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 overflow-hidden bg-accent/20">
                <img src="/founders/REza.png" alt="رضا حسن زاده" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-0.5">رضا حسن زاده</h3>
              <p className="text-accent mb-1 md:mb-2 text-xs md:text-sm font-medium">مدیر المنتج</p>
              <p className="text-content-secondary text-xs hidden md:block leading-relaxed">
                +۱۰ سال در گیمینگ. بنیان‌گذار استودیو، +۱۰ عنوان با +۲۵ میلیون بازیکن.
              </p>
              <p className="text-content-tertiary text-xs md:hidden">+۲۵M بازیکن</p>
              <div className="mt-1 md:mt-2 flex items-center justify-center gap-1 text-content-tertiary group-hover:text-accent transition-colors">
                <Linkedin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs hidden md:inline">LinkedIn</span>
              </div>
            </a>

            {/* Erfan Kouzehgaran - Marketing Lead */}
            <a
              href="https://www.linkedin.com/in/erfankouzehgaran/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-2 md:p-6 text-center hover:border-secondary/50 transition-colors group"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 overflow-hidden bg-secondary/20">
                <img src="/founders/erfan.png" alt="عرفان كوزه كران" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-0.5">عرفان كوزه كران</h3>
              <p className="text-secondary mb-1 md:mb-2 text-xs md:text-sm font-medium">مدير التسويق</p>
              <p className="text-content-secondary text-xs hidden md:block leading-relaxed">
                متخصص رشد. کمپین‌های UA با +۲۰۰K کاربر iOS در ۳ ماه.
              </p>
              <p className="text-content-tertiary text-xs md:hidden">+۲۰۰K UA</p>
              <div className="mt-1 md:mt-2 flex items-center justify-center gap-1 text-content-tertiary group-hover:text-secondary transition-colors">
                <Linkedin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs hidden md:inline">LinkedIn</span>
              </div>
            </a>

            {/* Sina Maleki - Tech Lead */}
            <a
              href="https://www.linkedin.com/in/jsinamaleki/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-2 md:p-6 text-center hover:border-cyan-500/50 transition-colors group"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 overflow-hidden bg-cyan-500/20">
                <img src="/founders/sina.png" alt="سينا ملكي" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-0.5">سينا ملكي</h3>
              <p className="text-cyan-400 mb-1 md:mb-2 text-xs md:text-sm font-medium">المدير التقني</p>
              <p className="text-content-secondary text-xs hidden md:block leading-relaxed">
                +۸ سال فول‌استک. React، React-Native، Web3. تجربه CTO.
              </p>
              <p className="text-content-tertiary text-xs md:hidden">+۸ سال دو</p>
              <div className="mt-1 md:mt-2 flex items-center justify-center gap-1 text-content-tertiary group-hover:text-cyan-400 transition-colors">
                <Linkedin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs hidden md:inline">LinkedIn</span>
              </div>
            </a>
          </div>
          <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2.5 md:p-5 max-w-3xl text-center mx-4">
            <p className="text-content-primary font-medium mb-1 text-xs md:text-base">لماذا ما؟</p>
            <p className="text-content-secondary text-xs md:text-sm">
              +۶ سال با هم بازی ساخالفريق. مجموعاً: +۲۵ میلیون بازیکن، +۱۰ عنوان منتشرشده، و خروج از استارتاپ.
            </p>
          </div>
        </div>

        {/* Slide 12: The Ask */}
        <div
          ref={(el) => { slideRefs.current[11] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4">
            الطلب
          </h2>
          <div className="text-3xl md:text-6xl font-bold mb-2 md:mb-6">
            <span className="text-accent" dir="ltr">$500K</span>
          </div>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-8">راند Pre-seed</p>

          <div className="grid grid-cols-2 gap-2 md:gap-6 max-w-4xl mb-4 md:mb-8 px-2">
            {/* Use of Funds */}
            <div className="bg-surface-elevated border border-border-muted rounded-lg md:rounded-2xl p-3 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-content-primary mb-2 md:mb-3">استفاده از سرمایه</h3>
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-content-secondary text-xs">مهندسی</span>
                  <div className="flex items-center gap-1">
                    <div className="w-10 md:w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div className="w-[40%] h-full bg-accent" />
                    </div>
                    <span className="text-content-primary font-medium text-xs" dir="ltr">40%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-content-secondary text-xs">GTM/کامیونیتی</span>
                  <div className="flex items-center gap-1">
                    <div className="w-10 md:w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div className="w-[25%] h-full bg-secondary" />
                    </div>
                    <span className="text-content-primary font-medium text-xs" dir="ltr">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-content-secondary text-xs">زیرساخت</span>
                  <div className="flex items-center gap-1">
                    <div className="w-10 md:w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div className="w-[20%] h-full bg-warning" />
                    </div>
                    <span className="text-content-primary font-medium text-xs" dir="ltr">20%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-content-secondary text-xs">امنیت/حقوقی</span>
                  <div className="flex items-center gap-1">
                    <div className="w-10 md:w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div className="w-[15%] h-full bg-error" />
                    </div>
                    <span className="text-content-primary font-medium text-xs" dir="ltr">15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Month Milestones */}
            <div className="bg-surface-elevated border border-border-muted rounded-lg md:rounded-2xl p-3 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-content-primary mb-2 md:mb-3">اهداف ۱۲ ماهه</h3>
              <div className="space-y-1.5 md:space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Gamepad2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent" />
                  </div>
                  <div>
                    <p className="text-content-primary font-medium text-xs">۱٬۰۰۰ بازی هاست‌شده</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <DollarSign className="w-2.5 h-2.5 md:w-3 md:h-3 text-success" />
                  </div>
                  <div>
                    <p className="text-content-primary font-medium text-xs" dir="ltr">$100K پرداخت به سازندگان</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-secondary" />
                  </div>
                  <div>
                    <p className="text-content-primary font-medium text-xs" dir="ltr">50K MAU پورتال</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-warning/20 flex items-center justify-center">
                    <Building2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-warning" />
                  </div>
                  <div>
                    <p className="text-content-primary font-medium text-xs">۳-۵ شریک استودیو</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Logo size={24} showText={false} className="md:hidden" />
            <Logo size={32} showText={false} className="hidden md:block" />
            <div>
              <p className="text-content-primary font-medium text-sm md:text-base">PlayCraft</p>
              <p className="text-content-tertiary text-xs md:text-sm">استوديو ألعاب بالذكاء الاصطناعي</p>
            </div>
          </div>
        </div>

        {/* Slide 13: Thank You */}
        <div
          ref={(el) => { slideRefs.current[12] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <div className="mb-6 md:mb-10">
            <Logo size={56} showText={false} className="md:hidden" />
            <Logo size={80} showText={false} className="hidden md:block" />
          </div>

          <h2 className="text-3xl md:text-6xl font-bold text-content-primary mb-4 md:mb-6 text-center">
            شكراً
          </h2>

          <p className="text-lg md:text-3xl text-accent font-medium mb-6 md:mb-10 text-center px-4">
            «من الفكرة إلى اللعبة في دقائق.»
          </p>

          <div className="bg-surface-elevated/50 border border-border-muted rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-10 text-center">
            <p className="text-content-primary font-semibold text-base md:text-xl mb-2">PlayCraft</p>
            <p className="text-content-secondary text-sm md:text-lg mb-4">استوديو ألعاب بالذكاء الاصطناعي</p>
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <a href="mailto:playcraft@ludaxis.io" className="flex items-center gap-2 text-content-tertiary hover:text-accent transition-colors">
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm" dir="ltr">playcraft@ludaxis.io</span>
              </a>
              <a href="https://playcraft.games" className="flex items-center gap-2 text-content-tertiary hover:text-accent transition-colors">
                <Globe className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm" dir="ltr">playcraft.games</span>
              </a>
            </div>
          </div>

          <p className="text-content-tertiary text-xs md:text-sm text-center">
            لنبني مستقبل صناعة الألعاب معاً.
          </p>
        </div>
      </div>
    </div>
  );
}
