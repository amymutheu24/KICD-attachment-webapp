import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <div className="font-display text-lg font-semibold">Kenya Institute of Curriculum Development</div>
          <p className="mt-3 max-w-md text-sm text-sidebar-foreground/75">
            The official portal for industrial attachment applications at KICD. Apply, upload your documents,
            and track your status securely online.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-sidebar-foreground/60">Programme</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-sidebar-primary">About attachment</Link></li>
            <li><Link to="/departments" className="hover:text-sidebar-primary">Departments</Link></li>
            <li><Link to="/faq" className="hover:text-sidebar-primary">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-sidebar-foreground/60">Account</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-sidebar-primary">Sign in</Link></li>
            <li><Link to="/register" className="hover:text-sidebar-primary">Create account</Link></li>
            <li><Link to="/contact" className="hover:text-sidebar-primary">Contact support</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-sidebar-foreground/60 md:flex-row md:px-6">
          <div>© {new Date().getFullYear()} Kenya Institute of Curriculum Development. All rights reserved.</div>
          <div>Desai Road, off Murang'a Road · Nairobi, Kenya</div>
        </div>
      </div>
    </footer>
  );
}
