import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import productDetails from "@/assets/product-main-new.webp";
import productImage1 from "@/assets/LP_02.webp";
import productImage2 from "@/assets/LP_03.webp";
import productImage3 from "@/assets/LP_04.webp";
import { ChevronDown } from "lucide-react";
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

  return <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-6xl mx-auto bg-slate-50 rounded-none">
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