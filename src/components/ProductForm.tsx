import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, User, Phone } from "lucide-react";
import { algerianStates } from "@/data/algerianLocations";
import { toast } from "@/hooks/use-toast";

const ProductForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedState, setSelectedState] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    district: "",
    option: "option1",
  });

  const selectedStateData = algerianStates.find(
    (state) => state.id === selectedState
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !selectedState || !formData.district) {
      toast({
        title: "يرجى ملء جميع الحقول",
        description: "الرجاء إدخال جميع المعلومات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم إرسال الطلب بنجاح! 👍",
      description: "سنتصل بك قريباً لتأكيد الطلب",
    });
  };

  return (
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
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="state">🏙️ الولاية</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="اختر الولاية" />
              </SelectTrigger>
              <SelectContent>
                {algerianStates.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="district">🏘️ البلدية</Label>
            <Select
              value={formData.district}
              onValueChange={(value) =>
                setFormData({ ...formData, district: value })
              }
              disabled={!selectedState}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="اختر البلدية" />
              </SelectTrigger>
              <SelectContent>
                {selectedStateData?.districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block">الأثمان متوفرة</Label>
            <RadioGroup
              value={formData.option}
              onValueChange={(value) =>
                setFormData({ ...formData, option: value })
              }
              className="space-y-3"
            >
              <div className="flex items-center justify-between p-3 border-2 border-primary rounded-lg bg-primary/5">
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

              <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
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
            <div className="flex items-center gap-3 border rounded-lg">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full text-lg py-6" size="lg">
            اضغر هنا لتاكيد الطلب 👈
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
