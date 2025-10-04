import { Shield, Truck, CreditCard, HeadphonesIcon } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: "منتجات أصلية",
      description: "ضمان الجودة 100%",
    },
    {
      icon: Truck,
      title: "توصيل مجاني",
      description: "لجميع الولايات",
    },
    {
      icon: CreditCard,
      title: "الدفع عند الاستلام",
      description: "آمن ومضمون",
    },
    {
      icon: HeadphonesIcon,
      title: "دعم 24/7",
      description: "خدمة عملاء متميزة",
    },
  ];

  return (
    <div className="bg-card border rounded-lg p-6 mt-8">
      <h3 className="text-lg font-bold text-center mb-6">لماذا تختارنا؟</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-2 p-3 hover:bg-accent/50 rounded-lg transition-colors"
          >
            <badge.icon className="w-8 h-8 text-primary" />
            <div>
              <p className="font-semibold text-sm">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;
