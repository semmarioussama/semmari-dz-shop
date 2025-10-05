import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import productImage from "@/assets/product-main.jpg";

const ProductCarousel = () => {
  // Using the same image multiple times for demo - replace with actual product images
  const productImages = [
    productImage,
    productImage,
    productImage,
  ];

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 bg-sale-badge text-white px-3 py-1 rounded-lg text-sm font-bold z-10">
        تخفيض!
      </div>
      <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-lg text-sm font-bold z-10">
        السماعة اللي راح تهنيك 😍
      </div>
      
      <Carousel className="w-full">
        <CarouselContent>
          {productImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="bg-card rounded-lg overflow-hidden border">
                <img
                  src={image}
                  alt={`سماعة بلوتوث لاسلكية - صورة ${index + 1}`}
                  className="w-full h-auto"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};

export default ProductCarousel;
