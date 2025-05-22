import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import ProjectDialog from "./forms/projectInqueary";

export default function project() {
  return (
    <div
      className="mb-16 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-8 text-center"
    >
      <h2 className="text-3xl font-bold mb-4">
        Need a Quote for a Full-Length Project?
      </h2>
      <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
        Working on an EP, album, or a special project that requires custom
        attention? Get in touch for a personalized quote tailored to your
        specific needs.
      </p>

      <ProjectDialog>
        <Button
          className="inline-flex items-center py-4 text-lg font-semibold rounded transition-all transform hover:scale-105"
        >
          Request a Custom Quote
          <MoveRight />
        </Button>
      </ProjectDialog>
    </div>
  )
}
