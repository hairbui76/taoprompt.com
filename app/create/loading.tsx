import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container py-8 flex justify-center items-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}

