interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-indigo-900 text-white py-6 px-8 rounded-lg shadow-md mb-6">
      <h1 className="text-3xl font-bold text-center">{title}</h1>
      {subtitle && <p className="text-center mt-2">{subtitle}</p>}
    </div>
  )
}
