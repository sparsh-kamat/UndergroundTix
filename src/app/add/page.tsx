// src/app/add/page.tsx
"use client";

import AddSubscriptionCard from "@/components/subscription/AddSubscriptionCard";

// You might want to define these lists centrally or fetch them if they become dynamic
const handleSuccess = () => {
};

export default  function AddSubscriptionPage() {
    
  return (
    // Centering container
    <div className="flex flex-col flex-grow items-center justify-center bg-muted/40 px-4 py-4 ">
      <AddSubscriptionCard onSuccess={handleSuccess} />
    </div>
  );
}
// This code is a complete React component for adding a subscription.
