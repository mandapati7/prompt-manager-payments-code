import { PricingSection } from "./_components/pricing-section";

export const metadata = {
  title: "Pricing - Prompt Manager",
  description: "Simple and transparent pricing for Prompt Manager"
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container py-20">
        <div className="mx-auto max-w-[980px]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
            <p className="text-muted-foreground text-lg">Get started for free. Upgrade when you need more.</p>
          </div>
          <PricingSection />
        </div>
      </div>
    </div>
  );
}
