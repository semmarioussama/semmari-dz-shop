import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";
import productImage from "@/assets/product-main.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Order Form - Left Side */}
          <div className="order-2 md:order-1">
            <ProductForm />
          </div>

          {/* Product Info - Right Side */}
          <div className="order-1 md:order-2">
            <div className="sticky top-8">
              <div className="relative">
                <div className="absolute top-4 right-4 bg-sale-badge text-white px-3 py-1 rounded-lg text-sm font-bold z-10">
                  تخفيض!
                </div>
                <div className="bg-card rounded-lg overflow-hidden border">
                  <img
                    src={productImage}
                    alt="سماعة بلوتوث لاسلكية"
                    className="w-full h-auto"
                  />
                  <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-lg text-sm font-bold">
                    حزام السباحة اللي راح يهنيك 😍
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h1 className="text-3xl font-bold text-foreground">
                  سماعة بلوتوث لاسلكية: صوت نقي وجودة عالية
                </h1>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary">
                    2.400 د.ج
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    3.500 د.ج
                  </span>
                  <span className="bg-sale-badge text-white px-3 py-1 rounded-lg text-sm font-bold">
                    31%
                  </span>
                </div>

                <div className="bg-card border rounded-lg p-6 space-y-3">
                  <h3 className="font-bold text-lg mb-3">مواصفات المنتج:</h3>
                  <ul className="space-y-2 text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>تقنية بلوتوث 5.0 للاتصال السريع والمستقر</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>جودة صوت عالية مع bass قوي</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>بطارية تدوم حتى 12 ساعة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>مقاومة للماء IPX7</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>تصميم عصري وأنيق</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>إضاءة LED ملونة</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/10 border-r-4 border-primary rounded-lg p-4">
                  <p className="text-sm">
                    <strong>ملاحظة:</strong> التوصيل مجاني لجميع الولايات. الدفع عند الاستلام.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
