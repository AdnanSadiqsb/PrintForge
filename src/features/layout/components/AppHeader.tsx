import { FiSearch, FiShoppingCart, FiUser } from "react-icons/fi";
import { Button } from "../../../components/ui";

const navItems = ["Products", "Designs", "Pricing", "How It Works"];

export const AppHeader = () => (
  <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
    <div className="mx-auto flex w-full max-w-[1440px] items-center gap-6 px-5 py-3.5 lg:px-8">
      <div className="flex min-w-[180px] items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold uppercase tracking-[0.22em] text-white">
          TS
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-600/80">Studio</p>
          <h1 className="text-lg font-semibold text-slate-900">ThreadSmith</h1>
        </div>
      </div>

      <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
        {navItems.map((item) => (
          <a
            key={item}
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            href="/#"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Button className="hidden md:inline-flex" variant="primary">
          Create Your Shirt
        </Button>
        <Button aria-label="Search" className="h-10 w-10 rounded-full p-0" variant="ghost">
          <FiSearch />
        </Button>
        <Button aria-label="Account" className="h-10 w-10 rounded-full p-0" variant="ghost">
          <FiUser />
        </Button>
        <Button aria-label="Cart" className="h-10 w-10 rounded-full p-0" variant="ghost">
          <FiShoppingCart />
        </Button>
      </div>
    </div>
  </header>
);
