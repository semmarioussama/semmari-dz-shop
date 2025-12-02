import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "@/types/tiktok";
import { Minus, Plus, User, Phone, Loader2 } from "lucide-react";
import { algerianStates } from "@/data/algerianLocations";
import { deliveryTariffs } from "@/data/deliveryTariffs";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Algerian phone validation schema
const phoneSchema = z.string().regex(/^(05|06|07)\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 05، 06، أو 07 ويحتوي على 10 أرقام");
const formSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل").max(100),
  phone: phoneSchema,
  district: z.string().min(1, "يرجى اختيار البلدية"),
  address: z.string().trim().min(5, "العنوان يجب أن يحتوي على 5 أحرف على الأقل").max(200),
  option: z.string(),
  deliveryMethod: z.enum(["home", "desk"], { errorMap: () => ({ message: "يرجى اختيار طريقة التوصيل" }) })
});
interface ProductFormProps {
  productName: string;
}
const ProductForm = ({
  productName
}: ProductFormProps) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedState, setSelectedState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ttclid, setTtclid] = useState<string | null>(null);
  const [formLoadTime] = useState(Date.now()); // Track when form loads
  const [sessionId] = useState(() => crypto.randomUUID()); // Unique session ID
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    district: "",
    address: "",
    option: "option1",
    deliveryMethod: "" as "" | "home" | "desk",
    website: "" // Honeypot field - should stay empty
  });
  
  // Capture TikTok Click ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clickId = urlParams.get('ttclid') || localStorage.getItem('ttclid');
    if (clickId) {
      localStorage.setItem('ttclid', clickId);
      setTtclid(clickId);
    }
  }, []);
  const selectedStateData = algerianStates.find(state => state.id === selectedState);

  // Save form data to abandoned_carts table as user types
  useEffect(() => {
    const hasFormData = formData.fullName || formData.phone || selectedState || formData.district || formData.address;
    
    if (hasFormData) {
      // Debounce to avoid too many updates
      const timeoutId = setTimeout(async () => {
        try {
          const selectedStateData = algerianStates.find(state => state.id === selectedState);
          
          // Upsert to abandoned_carts table
          await supabase
            .from('abandoned_carts')
            .upsert({
              session_id: sessionId,
              customer_name: formData.fullName || null,
              phone: formData.phone || null,
              state: selectedStateData?.name || null,
              district: formData.district || null,
              address: formData.address || null,
              selected_option: formData.option,
              quantity: quantity,
              delivery_method: formData.deliveryMethod || null,
              ttclid: ttclid,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'session_id'
            });
        } catch (error) {
          console.error('Error saving abandoned cart:', error);
        }
      }, 1000); // Wait 1 second after user stops typing
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, selectedState, quantity, sessionId, ttclid]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedState) {
      toast({
        title: "يرجى اختيار الولاية",
        description: "الرجاء اختيار الولاية من القائمة",
        variant: "destructive"
      });
      return;
    }

    // Validate form data with Zod
    const validation = formSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "خطأ في البيانات",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedStateData = algerianStates.find(state => state.id === selectedState);
      const selectedDistrictData = selectedStateData?.districts.find(district => district.id === formData.district);

      // Call secure Edge Function with server-side validation
      const {
        data,
        error
      } = await supabase.functions.invoke('submit-order', {
        body: {
          productName: productName,
          fullName: validation.data.fullName,
          phone: validation.data.phone,
          state: selectedStateData?.name,
          stateId: selectedState,
          district: selectedDistrictData?.name,
          address: validation.data.address,
          selectedOption: formData.option,
          quantity: quantity,
          deliveryMethod: validation.data.deliveryMethod,
          website: formData.website, // Honeypot field
          formLoadTime, // Time when form loaded
          formSubmitTime: Date.now(), // Time when submitted
          ttclid: ttclid, // Pass TikTok click ID
          sessionId: sessionId // Pass session ID to mark cart as completed
        }
      });
      if (error) {
        throw new Error(error.message || 'Failed to submit order');
      }
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to submit order');
      }

      // Navigate to thank you page with order reference, customer name, and phone
      // TikTok tracking will happen on thank-you page with proper phone formatting
      navigate(`/thank-you?ref=${data.orderReference}&name=${encodeURIComponent(validation.data.fullName)}&phone=${encodeURIComponent(validation.data.phone)}&value=${6350 * quantity}`);
    } catch (error) {
      console.error("Error sending order:", error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="bg-card border-2 border-primary/10 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">👇 أضف معلوماتك هنا للطلب:</h3>

        <div className="space-y-3 sm:space-y-4">
          {/* Honeypot field - hidden from users, bots will fill it */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          
          <div>
            <Label htmlFor="fullName" className="flex items-center gap-2 text-sm sm:text-base">
              <User className="w-4 h-4" />
              الإسم الكامل
            </Label>
            <Input 
              id="fullName" 
              value={formData.fullName} 
              onChange={e => setFormData({
                ...formData,
                fullName: e.target.value
              })} 
              className="mt-1 h-11 sm:h-10 text-base" 
              required 
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm sm:text-base">
              <Phone className="w-4 h-4" />
              رقم الهاتف (رقم الواتساب)
            </Label>
            <Input 
              id="phone" 
              type="tel" 
              value={formData.phone} 
              onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} 
              className="mt-1 h-11 sm:h-10 text-base" 
              required 
            />
          </div>

          <div>
            <Label htmlFor="state">🏙️ الولاية</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="mt-1 h-12 sm:h-10 text-base">
                <SelectValue placeholder="اختر الولاية" />
              </SelectTrigger>
              <SelectContent>
                {algerianStates.map(state => <SelectItem key={state.id} value={state.id}>
                    {state.id}- {state.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="district">🏘️ البلدية</Label>
            <Select value={formData.district} onValueChange={value => setFormData({
            ...formData,
            district: value
          })} disabled={!selectedState}>
              <SelectTrigger className="mt-1 h-12 sm:h-10 text-base">
                <SelectValue placeholder="اختر البلدية" />
              </SelectTrigger>
              <SelectContent>
                {selectedStateData?.districts.map(district => <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address" className="text-sm sm:text-base">📍 العنوان</Label>
            <Input 
              id="address" 
              value={formData.address} 
              onChange={e => setFormData({
                ...formData,
                address: e.target.value
              })} 
              className="mt-1 h-11 sm:h-10 text-base placeholder:text-sm" 
              placeholder="مثال: حي 500 مسكن ، عمارة 06" 
              required 
            />
          </div>

          <div>
            <Label htmlFor="deliveryMethod" className="text-sm sm:text-base">🚚 طريقة التوصيل</Label>
            <Select value={formData.deliveryMethod} onValueChange={(value: "home" | "desk") => {
              const tariff = deliveryTariffs.find(t => t.stateId === selectedState);
              if (value === 'desk' && tariff && tariff.deskPrice === 0) {
                return; // Prevent selecting desk if not available
              }
              setFormData({
                ...formData,
                deliveryMethod: value
              });
            }}>
              <SelectTrigger className="mt-1 h-11 sm:h-10 text-base">
                <SelectValue placeholder="اختر طريقة التوصيل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home" className="text-base py-3">توصيل إلى المنزل</SelectItem>
                <SelectItem 
                  value="desk" 
                  className="text-base py-3"
                  disabled={(() => {
                    const tariff = deliveryTariffs.find(t => t.stateId === selectedState);
                    return tariff ? tariff.deskPrice === 0 : false;
                  })()}
                >
                  توصيل إلى المكتب
                  {(() => {
                    const tariff = deliveryTariffs.find(t => t.stateId === selectedState);
                    return tariff && tariff.deskPrice === 0 ? ' (غير متوفر)' : '';
                  })()}
                </SelectItem>
              </SelectContent>
            </Select>
            {(() => {
              const tariff = deliveryTariffs.find(t => t.stateId === selectedState);
              if (tariff && tariff.deskPrice === 0 && selectedState) {
                return <p className="text-sm text-amber-600 mt-1">⚠️ التوصيل إلى المكتب غير متوفر في هذه الولاية. متوفر فقط التوصيل إلى المنزل.</p>;
              }
              return null;
            })()}
          </div>

          <div className="flex flex-col items-center gap-2 pt-2">
            <Label className="text-sm sm:text-base">الكمية</Label>
            <div className="flex items-center gap-3 border rounded-lg">
              <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isSubmitting} className="h-12 w-12 sm:h-11 sm:w-11 touch-manipulation">
                <Minus className="w-5 h-5" />
              </Button>
              <span className="w-14 text-center font-semibold text-lg sm:text-xl">{quantity}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} disabled={isSubmitting} className="h-12 w-12 sm:h-11 sm:w-11 touch-manipulation">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
            <h3 className="font-semibold text-base mb-3 text-foreground">ملخص الطلب</h3>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">السعر ({quantity} × 6,350 دج)</span>
              <span className="font-medium text-foreground">{(quantity * 6350).toLocaleString('ar-DZ')} دج</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">تكلفة التوصيل</span>
              <span className="font-medium text-foreground">
                {(() => {
                  if (!selectedState || !formData.deliveryMethod) return '---';
                  const tariff = deliveryTariffs.find(t => t.stateId === selectedState);
                  if (!tariff) return '---';
                  const deliveryCost = formData.deliveryMethod === 'home' ? tariff.homePrice : tariff.deskPrice;
                  if (deliveryCost === 0) return 'غير متوفر';
                  return `${deliveryCost.toLocaleString('ar-DZ')} دج`;
                })()}
              </span>
            </div>
            
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-base text-foreground">المجموع</span>
                <span className="font-bold text-lg text-red-600">
                  {(() => {
                    const itemsTotal = quantity * 6350;
                    if (!selectedState || !formData.deliveryMethod) return `${itemsTotal.toLocaleString('ar-DZ')} دج`;
                    const tariff = deliveryTariffs.find(t => t.stateId === selectedState);
                    if (!tariff) return `${itemsTotal.toLocaleString('ar-DZ')} دج`;
                    const deliveryCost = formData.deliveryMethod === 'home' ? tariff.homePrice : tariff.deskPrice;
                    if (deliveryCost === 0) return '---';
                    return `${(itemsTotal + deliveryCost).toLocaleString('ar-DZ')} دج`;
                  })()}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit" 
            size="lg" 
            disabled={isSubmitting} 
            className="w-full text-lg sm:text-xl py-6 sm:py-7 text-slate-50 text-right bg-lime-700 hover:bg-lime-600 active:bg-lime-800 rounded-lg animate-breathe touch-manipulation font-bold"
          >
            {isSubmitting ? <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin mx-[9px] my-[10px]" />
                جاري الإرسال...
              </> : "اضغط هنا لتأكيد الطلب"}
          </Button>
        </div>
      </div>
    </form>;
};
export default ProductForm;