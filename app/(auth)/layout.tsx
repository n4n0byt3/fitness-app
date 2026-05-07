export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] px-4">
      {children}
    </div>
  )
}
