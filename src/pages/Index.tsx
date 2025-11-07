import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Skeleton } from "@/components/ui/skeleton";
import productDetails from "@/assets/product-details-new.jpg";

const ProductForm = lazy(() => import("@/components/ProductForm"));

const Index = () => {
  return <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto bg-slate-50 rounded-none">
          {/* Order Form - Left Side */}
          <div className="order-2 md:order-1">
            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
              <ProductForm productName="سماعة بلوتوث لاسلكية: صوت نقي وجودة عالية" />
            </Suspense>
            <div className="relative mt-6">
              {/* Transparent overlay to prevent direct interaction */}
              <div className="absolute inset-0 z-10" />
              
              <img 
                src={productDetails} 
                alt="تفاصيل المنتج" 
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
          <div className="order-1 md:order-2">
            
          </div>
        </div>
      </main>
      
      <WhatsAppButton />
    </div>;
};
export default Index;