import { Github, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-1 border-t border-white/5 bg-slate-900/20 backdrop-blur-md py-8 mt-20">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 ">
        
        {/* Branding & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} <span className="text-slate-200">FocusFlow</span> by Priyanshu Bharti
          </p>
          <p className="text-slate-600 text-xs flex items-center gap-1">
            Built for Deep Work <Heart className="w-3 h-3 text-red-500/50" />
          </p>
        </div>

        {/* Links & Social */}
        <div className="flex items-center gap-8">
          <nav className="flex gap-6">
            <Link 
              href="#" 
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="#" 
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
            >
              Terms
            </Link>
          </nav>
          
          <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

          <Link
            href="https://github.com/PriyanshuBh"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300"
          >
            {/* <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Source Code</span> */}
            <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
          </Link>
        </div>

      </div>
    </footer>
  );
}