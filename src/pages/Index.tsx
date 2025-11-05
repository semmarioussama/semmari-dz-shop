import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import TrustBadges from "@/components/TrustBadges";
import ProductCarousel from "@/components/ProductCarousel";
import productImage from "@/assets/product-main.jpg";
import productDetails from "@/assets/product-details.jpg";
const Index = () => {
  return <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto bg-slate-50 rounded-none">
          {/* Order Form - Left Side */}
          <div className="order-2 md:order-1">
            <ProductForm productName="سماعة بلوتوث لاسلكية: صوت نقي وجودة عالية" />
            <img src={productDetails} alt="تفاصيل المنتج" className="w-full rounded-lg mt-6" />
            
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