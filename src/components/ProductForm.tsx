import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, User, Phone, Loader2 } from "lucide-react";
import { algerianStates } from "@/data/algerianLocations";
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
  option: z.string()
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
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    district: "",
    address: "",
    option: "option1"
  });
  const formSubmittedRef = useRef(false);
  const formStartedRef = useRef(false);
  const abandonedTimerRef = useRef<number | null>(null);
  const selectedStateData = algerianStates.find(state => state.id === selectedState);

  // Track when user starts filling the form
  useEffect(() => {
    if (formData.fullName || formData.phone || selectedState || formData.district !== "" || formData.address !== "") {
      formStartedRef.current = true;
    }
  }, [formData, selectedState]);

  // Send abandoned order webhook 1 minute after user leaves
  useEffect(() => {
    const sendAbandonedWebhook = () => {
      // Only send if user started filling but didn't submit
      if (formStartedRef.current && !formSubmittedRef.current) {
        const selectedStateData = algerianStates.find(state => state.id === selectedState);
        const selectedDistrictData = selectedStateData?.districts.find(district => district.id === formData.district);
        const abandonedData = {
          fullName: formData.fullName || null,
          phone: formData.phone || null,
          state: selectedStateData?.name || null,
          stateId: selectedState || null,
          district: selectedDistrictData?.name || null,
          districtId: formData.district || null,
          selectedOption: formData.option || null,
          quantity: quantity,
          abandonedAt: new Date().toISOString()
        };

        // Use sendBeacon for reliable delivery
        const webhookUrl = 'https://n8n-n8n.2ufl9p.easypanel.host/webhook-test/f0662916-6542-4ddb-a97b-fcd944ee5f19';
        navigator.sendBeacon(webhookUrl, JSON.stringify(abandonedData));
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Start 1-minute timer when user leaves
        abandonedTimerRef.current = window.setTimeout(() => {
          sendAbandonedWebhook();
        }, 60000); // 1 minute = 60000ms
      } else if (document.visibilityState === 'visible') {
        // Cancel timer if user returns
        if (abandonedTimerRef.current !== null) {
          clearTimeout(abandonedTimerRef.current);
          abandonedTimerRef.current = null;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clear timer on cleanup
      if (abandonedTimerRef.current !== null) {
        clearTimeout(abandonedTimerRef.current);
      }
    };
  }, [formData, selectedState, quantity]);
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
          quantity: quantity
        }
      });
      if (error) {
        throw new Error(error.message || 'Failed to submit order');
      }
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to submit order');
      }

      // Mark form as submitted to prevent abandoned order webhook
      formSubmittedRef.current = true;

      // Navigate to thank you page with order reference and customer name
      navigate(`/thank-you?ref=${data.orderReference}&name=${encodeURIComponent(validation.data.fullName)}`);
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
  return <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border-2 border-primary/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">👇 أضف معلوماتك هنا للطلب:</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              الإسم الكامل
            </Label>
            <Input id="fullName" value={formData.fullName} onChange={e => setFormData({
            ...formData,
            fullName: e.target.value
          })} className="mt-1" required />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف
            </Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({
            ...formData,
            phone: e.target.value
          })} className="mt-1" required />
          </div>

          <div>
            <Label htmlFor="state">🏙️ الولاية</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="mt-1">
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
              <SelectTrigger className="mt-1">
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
            <Label htmlFor="address">📍 العنوان</Label>
            <Input id="address" value={formData.address} onChange={e => setFormData({
            ...formData,
            address: e.target.value
          })} className="mt-1 placeholder:text-sm" placeholder="مثال: حي 500 مسكن ، عمارة 06" required />
          </div>

          <div className="flex flex-col items-center gap-2 pt-2">
            <Label>الكمية</Label>
            <div className="flex items-center gap-3 border rounded-lg">
              <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isSubmitting} className="h-12 w-12">
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} disabled={isSubmitting} className="h-12 w-12">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full text-lg py-6 text-slate-50 text-right bg-lime-700 hover:bg-lime-600 rounded-lg animate-breathe">
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