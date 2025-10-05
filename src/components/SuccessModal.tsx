import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  orderRef: string;
  onClose: () => void;
}

const SuccessModal = ({ isOpen, orderRef, onClose }: SuccessModalProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-green-500 text-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="w-20 h-20" strokeWidth={2} />
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
            تم إرسال طلبك بنجاح!
          </h2>
          <p className="text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
            رقم الطلب: {orderRef}
          </p>
          <p className="text-base" style={{ fontFamily: 'Arial, sans-serif' }}>
            سنتواصل معك قريباً لتأكيد الطلب
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
