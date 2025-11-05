import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Skeleton } from "@/components/ui/skeleton";
import productDetails from "@/assets/product-details.jpg";

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
            <img 
              src={productDetails} 
              alt="تفاصيل المنتج" 
              className="w-full rounded-lg mt-6" 
              loading="lazy"
              decoding="async"
            />
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