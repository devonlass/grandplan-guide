import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AccountPlanHeader } from "@/components/AccountPlanHeader";
import { AccountOverview } from "@/components/AccountOverview";
import { CustomerStrategy } from "@/components/CustomerStrategy";
import { OurStrategy } from "@/components/OurStrategy";
import { StakeholderMap } from "@/components/StakeholderMap";
import { ExecutionPlan } from "@/components/ExecutionPlan";
import { RisksAndDependencies } from "@/components/RisksAndDependencies";
import { QuarterlyReview } from "@/components/QuarterlyReview";
import { HubSpotBadge } from "@/components/HubSpotBadge";
import { Info, PanelLeft } from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 min-h-screen bg-background">
          {/* Mobile sidebar trigger */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <SidebarTrigger className="bg-primary text-primary-foreground p-2 rounded-md shadow-lg">
              <PanelLeft className="w-5 h-5" />
            </SidebarTrigger>
          </div>

          <AccountPlanHeader />
          
          <main className="max-w-6xl mx-auto px-6 py-8">
            {/* HubSpot Sync Legend */}
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
              <Info className="w-4 h-4" />
              <span>Fields marked with</span>
              <HubSpotBadge />
              <span>will sync to your CRM</span>
            </div>

            {/* Sections with IDs for navigation */}
            <div className="space-y-6">
              <section id="account-overview" className="scroll-mt-6">
                <AccountOverview />
              </section>
              
              {/* Two-column layout for strategy sections */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <section id="customer-strategy" className="scroll-mt-6">
                  <CustomerStrategy />
                </section>
                <section id="our-strategy" className="scroll-mt-6">
                  <OurStrategy />
                </section>
              </div>
              
              <section id="stakeholder-map" className="scroll-mt-6">
                <StakeholderMap />
              </section>
              
              <section id="execution-plan" className="scroll-mt-6">
                <ExecutionPlan />
              </section>
              
              <section id="risks-dependencies" className="scroll-mt-6">
                <RisksAndDependencies />
              </section>
              
              <section id="quarterly-review" className="scroll-mt-6">
                <QuarterlyReview />
              </section>
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              <p>Strategic Account Plan Template • Update quarterly before business review</p>
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
