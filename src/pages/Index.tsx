import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import productDetails from "@/assets/product-main-new.webp";
import productImage1 from "@/assets/LP_02.webp";
import productImage2 from "@/assets/LP_03.webp";
import productImage3 from "@/assets/LP_04.webp";
import { ChevronDown, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ProductForm = lazy(() => import("@/components/ProductForm"));

const Index = () => {
  // Track page visit
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await supabase.functions.invoke("track-visit", {
          body: { page_path: "/" },
        });
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };
    trackVisit();
  }, []);

  return <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-[100vw]">
      <Header />

      {/* Product Title and Price */}
      <div className="container mx-auto px-3 sm:px-4 py-6 text-center max-w-full">
        <p className="text-foreground text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
          فيسوز من شركة <span className="text-blue-600">POWERBLU</span> التابعة لعلامة <span className="text-red-600">HONESTPRO</span> بمحرك براشلس Sans Charbon وبطاريتين 16.8 V
        </p>
        <p className="text-red-600 text-3xl sm:text-4xl md:text-5xl font-bold animate-pulse">
          6500 دج
        </p>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 w-full max-w-full">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-6xl mx-auto bg-slate-50 rounded-none w-full max-w-full">
          {/* Order Form - Left Side */}
          <div className="order-2 md:order-1">
            {/* Indicator for images below */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 px-2">
              <ChevronDown className="text-red-600 animate-bounce" size={24} strokeWidth={3} />
              <p className="text-foreground font-bold text-base sm:text-xl">صور المنتج في الأسفل</p>
              <ChevronDown className="text-red-600 animate-bounce" size={24} strokeWidth={3} />
            </div>
            
            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
              <ProductForm productName="سماعة بلوتوث لاسلكية: صوت نقي وجودة عالية" />
            </Suspense>
            
            <div className="relative">
              {/* Transparent overlay to prevent direct interaction */}
              <div className="absolute inset-0 z-10" />
              
              <img 
                src={productDetails} 
                alt="تفاصيل المنتج" 
                className="w-full rounded-lg select-none pointer-events-none" 
                loading="eager"
                fetchPriority="high"
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  if (e.touches.length > 1) {
                    e.preventDefault();
                  }
                }}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                } as React.CSSProperties}
              />
            </div>

            {/* Additional Product Images */}
            <div className="relative mt-4">
              <div className="absolute inset-0 z-10" />
              <img 
                src={productImage1} 
                alt="تفاصيل المنتج 1" 
                className="w-full rounded-lg select-none pointer-events-none" 
                loading="lazy"
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  if (e.touches.length > 1) {
                    e.preventDefault();
                  }
                }}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                } as React.CSSProperties}
              />
            </div>

            <div className="relative mt-4">
              <div className="absolute inset-0 z-10" />
              <img 
                src={productImage2} 
                alt="تفاصيل المنتج 2" 
                className="w-full rounded-lg select-none pointer-events-none" 
                loading="lazy"
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  if (e.touches.length > 1) {
                    e.preventDefault();
                  }
                }}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                } as React.CSSProperties}
              />
            </div>

            <div className="relative mt-4">
              <div className="absolute inset-0 z-10" />
              <img 
                src={productImage3} 
                alt="تفاصيل المنتج 3" 
                className="w-full rounded-lg select-none pointer-events-none" 
                loading="lazy"
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  if (e.touches.length > 1) {
                    e.preventDefault();
                  }
                }}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                } as React.CSSProperties}
              />
            </div>

            {/* Scroll to Form Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg shadow-lg animate-pulse hover:animate-none transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="اشتري الآن - Scroll to form"
              >
                <span className="flex items-center gap-2">
                  اشتري الآن
                  <ArrowUp className="w-5 h-5 group-hover:translate-y-[-4px] transition-transform" />
                </span>
              </button>
            </div>
          </div>

          {/* Product Info - Right Side */}
          <div className="order-1 md:order-2 space-y-3 sm:space-y-4">
            <div className="md:sticky md:top-4">
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default Index;