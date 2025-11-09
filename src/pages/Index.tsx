import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Skeleton } from "@/components/ui/skeleton";
import productDetails from "@/assets/product-main-new.webp";
import { ChevronDown } from "lucide-react";

const ProductForm = lazy(() => import("@/components/ProductForm"));

const Index = () => {
  return <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto bg-slate-50 rounded-none">
          {/* Order Form - Left Side */}
          <div className="order-2 md:order-1">
            {/* Indicator for images below */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <ChevronDown className="text-red-600 animate-bounce" size={32} strokeWidth={3} />
              <p className="text-foreground font-bold text-xl">صور المنتج في الأسفل</p>
              <ChevronDown className="text-red-600 animate-bounce" size={32} strokeWidth={3} />
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
                className="rounded-lg select-none pointer-events-none" 
                loading="eager"
                decoding="sync"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  if (e.touches.length > 1) {
                    e.preventDefault();
                  }
                }}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  width: 'auto',
                  display: 'block',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  imageRendering: 'crisp-edges',
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Product Info - Right Side */}
          <div className="order-1 md:order-2">
            
          </div>
        </div>
      </main>
      
      <WhatsAppButton />
    </div>;
};
export default Index;