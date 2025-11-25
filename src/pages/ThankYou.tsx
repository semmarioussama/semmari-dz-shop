import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

// Declare TikTok Pixel type
declare global {
  interface Window {
    ttq?: {
      track: (event: string, data?: any) => void;
    };
  }
}

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderRef = searchParams.get("ref");
  const customerName = searchParams.get("name");
  const customerPhone = searchParams.get("phone");

  // Hash function for TikTok pixel (SHA-256)
  const hashValue = async (value: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    // Redirect to home if no order reference
    if (!orderRef) {
      navigate("/");
      return;
    }

    // Function to track conversion with retry logic
    const trackConversion = async (attempt = 1) => {
      if (window.ttq && typeof window.ttq.track === 'function') {
        try {
          // Prepare event data with hashed phone if available
          const eventData: any = {
            content_id: orderRef,
            content_name: 'سماعة بلوتوث لاسلكية',
            value: 2990,
            currency: 'DZD'
          };

          // Add hashed phone number if available (required by TikTok)
          if (customerPhone) {
            eventData.phone_number = await hashValue(customerPhone);
          }

          window.ttq.track('CompletePayment', eventData);
          console.log('✅ TikTok CompletePayment tracked:', orderRef, 'Attempt:', attempt, 'With phone:', !!customerPhone);
        } catch (error) {
          console.error('❌ Error tracking TikTok event:', error);
        }
      } else {
        console.log('⏳ TikTok Pixel not ready yet, attempt:', attempt);
        // Retry up to 3 times with increasing delays
        if (attempt < 4) {
          setTimeout(() => trackConversion(attempt + 1), attempt * 1000);
        } else {
          console.error('❌ TikTok Pixel failed to load after multiple attempts');
        }
      }
    };

    // Start tracking
    trackConversion();
  }, [orderRef, navigate]);

  if (!orderRef) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 md:p-12 text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={2} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-green-700">
              تم إرسال طلبك بنجاح!
            </h1>
            
            {customerName && (
              <p className="text-xl md:text-2xl text-gray-700">
                شكراً لك {customerName}
              </p>
            )}
            
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <p className="text-lg text-gray-600 mb-2">رقم الطلب</p>
              <p className="text-2xl font-bold text-green-600">{orderRef}</p>
            </div>
            
            <div className="space-y-3 text-lg text-gray-700">
              <p>
                محل كنكايري سماري يشكرك على طلبك
              </p>
              <p>
                سنتواصل معك قريباً لتأكيد الطلب
              </p>
            </div>
            
            <Button 
              onClick={() => navigate("/")}
              size="lg"
              className="mt-6 text-lg gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThankYou;
