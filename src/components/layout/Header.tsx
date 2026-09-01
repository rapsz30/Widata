interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0">
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
