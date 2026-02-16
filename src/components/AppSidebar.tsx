import { 
  Building2, 
  Target, 
  Lightbulb, 
  Users, 
  ListChecks, 
  AlertTriangle, 
  CalendarCheck,
  FileText,
  ChevronLeft,
  Paperclip
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const sections = [
  { title: "Account Overview", id: "account-overview", icon: Building2 },
  { title: "Customer Strategy", id: "customer-strategy", icon: Target },
  { title: "Our Strategy", id: "our-strategy", icon: Lightbulb },
  { title: "Stakeholder Map", id: "stakeholder-map", icon: Users },
  { title: "Execution Plan", id: "execution-plan", icon: ListChecks },
  { title: "Risks & Dependencies", id: "risks-dependencies", icon: AlertTriangle },
  { title: "Quarterly Review", id: "quarterly-review", icon: CalendarCheck },
  { title: "Attachments", id: "attachments", icon: Paperclip },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        {/* Logo/Header */}
        <div className="px-4 pb-4 border-b border-sidebar-border mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sidebar-primary flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-semibold text-sidebar-foreground text-sm">
                Account Plan
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Sections
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    onClick={() => scrollToSection(section.id)}
                    tooltip={section.title}
                    className="cursor-pointer hover:bg-sidebar-accent transition-colors"
                  >
                    <section.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{section.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapse trigger at bottom */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <SidebarTrigger className="w-full justify-center" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
