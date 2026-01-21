import { AccountPlanHeader } from "@/components/AccountPlanHeader";
import { AccountOverview } from "@/components/AccountOverview";
import { CustomerStrategy } from "@/components/CustomerStrategy";
import { OurStrategy } from "@/components/OurStrategy";
import { StakeholderMap } from "@/components/StakeholderMap";
import { ExecutionPlan } from "@/components/ExecutionPlan";
import { RisksAndDependencies } from "@/components/RisksAndDependencies";
import { QuarterlyReview } from "@/components/QuarterlyReview";
import { HubSpotBadge } from "@/components/HubSpotBadge";
import { Info } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AccountPlanHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* HubSpot Sync Legend */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
          <Info className="w-4 h-4" />
          <span>Fields marked with</span>
          <HubSpotBadge />
          <span>will sync to your CRM</span>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <AccountOverview />
          
          {/* Two-column layout for strategy sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CustomerStrategy />
            <OurStrategy />
          </div>
          
          <StakeholderMap />
          <ExecutionPlan />
          <RisksAndDependencies />
          <QuarterlyReview />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>Strategic Account Plan Template • Update quarterly before business review</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
