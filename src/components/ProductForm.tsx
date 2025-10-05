import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, User, Phone, Loader2 } from "lucide-react";
import { algerianStates } from "@/data/algerianLocations";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import SuccessModal from "@/components/SuccessModal";

// Algerian phone validation schema
const phoneSchema = z.string().regex(/^(05|06|07)\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 05، 06، أو 07 ويحتوي على 10 أرقام");
const formSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل").max(100),
  phone: phoneSchema,
  district: z.string().min(1, "يرجى اختيار البلدية"),
  option: z.string()
});
const ProductForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedState, setSelectedState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    district: "",
    option: "option1"
  });
  const selectedStateData = algerianStates.find(state => state.id === selectedState);
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

      // Generate order reference
      const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const orderData = {
        orderReference: orderRef,
        fullName: validation.data.fullName,
        phone: validation.data.phone,
        state: selectedStateData?.name,
        district: selectedDistrictData?.name,
        option: formData.option,
        quantity: quantity,
        timestamp: new Date().toISOString()
      };
      const response = await fetch("https://n8n-n8n.2ufl9p.easypanel.host/webhook-test/05f1b4ac-24ca-444c-93b8-c39145cf9930", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error("Network response was not ok");

      // Reset form
      setFormData({
        fullName: "",
        phone: "",
        district: "",
        option: "option1"
      });
      setSelectedState("");
      setQuantity(1);

      // Show success modal
      setOrderReference(orderRef);
      setShowSuccessModal(true);
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
  return <>
      <SuccessModal isOpen={showSuccessModal} orderRef={orderReference} onClose={() => setShowSuccessModal(false)} />
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border-2 border-primary/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          👇 أضف معلوماتك في الأسفل للطلب
        </h3>

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
                    {state.name}
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
            <Label className="mb-3 block">الأثمان متوفرة</Label>
            <RadioGroup value={formData.option} onValueChange={value => setFormData({
              ...formData,
              option: value
            })} className="space-y-3">
              <div className="flex items-center justify-between p-3 border-2 border-primary rounded-lg bg-amber-200">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="option1" id="option1" />
                  <Label htmlFor="option1" className="cursor-pointer font-medium">
                    طلب 01
                  </Label>
                </div>
                <div className="text-left">
                  <span className="font-bold text-primary">2.400 د.ج</span>
                  <span className="text-sm text-muted-foreground line-through mr-2">
                    3.500 د.ج
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors bg-amber-200">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="option2" id="option2" />
                  <Label htmlFor="option2" className="cursor-pointer font-medium">
                    طلب 02
                  </Label>
                </div>
                <div className="text-left">
                  <span className="font-bold text-primary">4.700 د.ج</span>
                  <span className="text-sm text-muted-foreground line-through mr-2">
                    7.000 د.ج
                  </span>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between pt-2">
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

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full text-lg py-6 text-slate-50 text-right bg-lime-700 hover:bg-lime-600 rounded-lg">
            {isSubmitting ? <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                جاري الإرسال...
              </> : "اضغر هنا لتاكيد الطلب 👈"}
          </Button>
        </div>
      </div>
    </form>
    </>;
};
export default ProductForm;