import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Upload, Loader2, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductEditorProps {
  productId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

export function ProductEditor({ productId, onClose, onSuccess }: ProductEditorProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    current_price: "",
    original_price: "",
    is_active: true,
  });
  const [specifications, setSpecifications] = useState<string[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newSpec, setNewSpec] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      setFormData({
        title: product.title,
        description: product.description || "",
        current_price: product.current_price.toString(),
        original_price: product.original_price.toString(),
        is_active: product.is_active,
      });

      if (product.specifications && Array.isArray(product.specifications)) {
        setSpecifications(product.specifications.map(spec => String(spec)));
      }

      const { data: imageData, error: imageError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order", { ascending: true });

      if (imageError) throw imageError;
      setImages(imageData || []);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل المنتج",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (productId) {
        const newImages = uploadedUrls.map((url, index) => ({
          product_id: productId,
          image_url: url,
          display_order: images.length + index,
        }));

        const { data, error } = await supabase
          .from("product_images")
          .insert(newImages)
          .select();

        if (error) throw error;
        setImages([...images, ...data]);
      } else {
        const tempImages = uploadedUrls.map((url, index) => ({
          id: `temp-${index}`,
          image_url: url,
          alt_text: null,
          display_order: images.length + index,
        }));
        setImages([...images, ...tempImages]);
      }

      toast({ title: "تم رفع الصور بنجاح" });
    } catch (error: any) {
      toast({
        title: "خطأ في رفع الصور",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageId: string, imageUrl: string) => {
    try {
      if (!imageId.startsWith("temp-")) {
        const { error } = await supabase
          .from("product_images")
          .delete()
          .eq("id", imageId);

        if (error) throw error;
      }

      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("product-images").remove([fileName]);
      }

      setImages(images.filter((img) => img.id !== imageId));
      toast({ title: "تم حذف الصورة" });
    } catch (error: any) {
      toast({
        title: "خطأ في حذف الصورة",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addSpecification = () => {
    if (newSpec.trim()) {
      setSpecifications([...specifications, newSpec.trim()]);
      setNewSpec("");
    }
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        current_price: parseFloat(formData.current_price),
        original_price: parseFloat(formData.original_price),
        is_active: formData.is_active,
        specifications: specifications,
        discount_percentage: Math.round(
          ((parseFloat(formData.original_price) - parseFloat(formData.current_price)) /
            parseFloat(formData.original_price)) *
            100
        ),
      };

      if (productId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);

        if (error) throw error;
        toast({ title: "تم تحديث المنتج بنجاح" });
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) throw error;

        if (images.length > 0) {
          const imageData = images.map((img, index) => ({
            product_id: newProduct.id,
            image_url: img.image_url,
            display_order: index,
          }));

          const { error: imageError } = await supabase
            .from("product_images")
            .insert(imageData);

          if (imageError) throw imageError;
        }

        toast({ title: "تم إضافة المنتج بنجاح" });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ المنتج",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان المنتج</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label>صور المنتج</Label>
        <div className="grid grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group overflow-hidden">
              <img
                src={image.image_url}
                alt={image.alt_text || "صورة المنتج"}
                className="w-full h-32 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(image.id, image.image_url)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <Label htmlFor="image-upload" className="cursor-pointer">
            <Button type="button" variant="outline" asChild disabled={uploading}>
              <span>
                {uploading ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="ml-2 h-4 w-4" />
                )}
                رفع صور
              </span>
            </Button>
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>المواصفات</Label>
        <div className="space-y-2">
          {specifications.map((spec, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Input value={spec} disabled className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSpecification(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              placeholder="أضف مواصفة جديدة..."
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecification())}
            />
            <Button type="button" variant="outline" onClick={addSpecification}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current_price">السعر الحالي (دج)</Label>
          <Input
            id="current_price"
            type="number"
            step="0.01"
            value={formData.current_price}
            onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="original_price">السعر الأصلي (دج)</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            value={formData.original_price}
            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">المنتج نشط</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {productId ? "تحديث المنتج" : "إضافة المنتج"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
