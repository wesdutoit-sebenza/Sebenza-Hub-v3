import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import GradientBlob from "./GradientBlob";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string;
  gradientVariant?: "violet-cyan" | "cyan" | "green" | "amber";
}

export default function PageHeader({ title, description, breadcrumb, gradientVariant = "cyan" }: PageHeaderProps) {
  return (
    <div className="relative py-16 px-6 overflow-hidden border-b">
      <GradientBlob variant={gradientVariant} />
      <div className="max-w-7xl mx-auto relative z-10">
        {breadcrumb && (
          <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link 
              href="/" 
              data-testid="link-breadcrumb-home" 
              className="hover:text-foreground hover-elevate px-2 py-1 rounded-md"
            >
              Home
            </Link>
            <ChevronRight size={16} />
            <span data-testid="text-breadcrumb-current">{breadcrumb}</span>
          </nav>
        )}
        <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4" data-testid="text-page-title">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl" data-testid="text-page-description">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
