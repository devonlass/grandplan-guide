import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AccountPlanHeader } from "@/components/AccountPlanHeader";
import { AccountOverview } from "@/components/AccountOverview";
import { CustomerStrategy } from "@/components/CustomerStrategy";
import { OurStrategy } from "@/components/OurStrategy";
import { StakeholderMap } from "@/components/StakeholderMap";
import { ExecutionPlan } from "@/components/ExecutionPlan";
import { RisksAndDependencies } from "@/components/RisksAndDependencies";
import { Attachments } from "@/components/Attachments";
import { QuarterlyReview } from "@/components/QuarterlyReview";
import { HubSpotBadge } from "@/components/HubSpotBadge";
import { useParams } from "react-router-dom";
import { Info, PanelLeft } from "lucide-react";

const PlanDetail = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 min-h-screen bg-background">
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <SidebarTrigger className="bg-primary text-primary-foreground p-2 rounded-md shadow-lg">
              <PanelLeft className="w-5 h-5" />
            </SidebarTrigger>
          </div>
          <AccountPlanHeader />
          <main className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
              <Info className="w-4 h-4" />
              <span>Fields marked with</span>
              <HubSpotBadge />
              <span>will sync to your CRM</span>
            </div>
            <div className="space-y-6">
              <section id="account-overview" className="scroll-mt-6">
                <AccountOverview planId={id} />
              </section>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <section id="customer-strategy" className="scroll-mt-6">
                  <CustomerStrategy planId={id} />
                </section>
                <section id="our-strategy" className="scroll-mt-6">
                  <OurStrategy planId={id} />
                </section>
              </div>
              <section id="stakeholder-map" className="scroll-mt-6">
                <StakeholderMap planId={id} />
              </section>
              <section id="execution-plan" className="scroll-mt-6">
                <ExecutionPlan planId={id} />
              </section>
              <section id="risks-dependencies" className="scroll-mt-6">
                <RisksAndDependencies planId={id} />
              </section>
              <section id="quarterly-review" className="scroll-mt-6">
                <QuarterlyReview planId={id} />
              </section>
              <section id="attachments" className="scroll-mt-6">
                <Attachments />
              </section>
            </div>
            <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              <p>Strategic Account Plan Template • Update quarterly before business review</p>
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PlanDetail;