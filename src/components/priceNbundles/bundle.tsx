import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import sanitizeHtml from "sanitize-html";
import { cn } from "@/lib/utils";
import type { Deal } from "./types";

interface BundleProps {
  deal: Deal;
  glow: boolean;
}

// Formats text with custom markup while ensuring security
const formatText = (text: string) => {
  // First sanitize input to remove any existing HTML
  text = sanitizeHtml(text, { allowedTags: [] });

  // Define regex patterns with non-greedy matches and word boundaries
  const underline = /__([^_\n]+?)__/g;  // matches text between __ __, no nested underscores
  const bold = /\*\*([^*\n]+?)\*\*/g;   // matches text between ** **, no nested asterisks
  const note = /\*([^*\n]+?)\*/g;       // matches text between * *, no nested asterisks

  // Apply formatting with Tailwind classes
  text = text.replaceAll(underline, '<span class="text-red-400 underline">$1</span>');
  text = text.replaceAll(bold, '<span class="font-bold text-green-400">$1</span>');
  text = text.replaceAll(note, '<span class="mt-1 ml-1 text-sm text-gray-400 italic">$1</span>');

  // Handle line breaks
  text = text
    .split("\\n")
    .map((line) => line.trim())
    .join("<br/>");

  // Final sanitization with strict tag allowance
  return sanitizeHtml(text, {
    allowedTags: ['span', 'br'],
    allowedAttributes: {
      'span': ['class']
    },
    // Only allow specific Tailwind classes
    allowedClasses: {
      'span': [
        'text-red-400', 'underline',              // for underlined text
        'font-bold', 'text-green-400',            // for bold text
        'mt-1', 'ml-1', 'text-sm', 'text-gray-400', 'italic'  // for notes
      ]
    }
  });
};

// Included component converted to React component
const Included = ({ text }: { text: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: formatText(text) }} />;
};

// Main Bundle component (rest remains the same)
const Bundle: React.FC<BundleProps> = ({ deal, glow }) => {
  if (deal == undefined) {
    throw new Error("No deal");
  }

  return (
    <div
      className={cn(
        "bg-black/30 backdrop-blur-sm p-6 rounded-lg group transition relative",
        glow
          ? "border-2 border-red-500/50 hover:border-red-500/90 transform scale-105 shadow-lg shadow-red-900/50"
          : "border border-red-500/30 hover:border-red-500/70"
      )}
    >
      {deal.tag && (
        <Badge
          className="absolute -top-3 right-4 bg-red-500 group-hover:bg-primary/90 uppercase rounded-md"
        >
          {deal.tag}
        </Badge>
      )}

      <h2 className="text-3xl font-bold text-center mb-2">{deal.name}</h2>
      <div className="flex flex-col items-center gap-2 mb-4 relative">
        <span className="text-3xl font-bold text-green-400">${deal.price}</span>
        {deal.valuePrice && (
          <span className="text-xl text-yellow-400">
            (${deal.valuePrice} Value){" "}
            {deal.discountTag && (
              <span className="bg-red-600 text-white text-[12px] font-bold px-2 py-1 rounded-full">
                {deal.discountTag}% OFF
              </span>
            )}
          </span>
        )}
      </div>

      {deal.subtitle && (
        <h3 className="text-sm text-center text-gray-300 mb-6 font-jose">
          {deal.subtitle}
        </h3>
      )}

      {deal.includes.length > 0 && (
        <>
          <h3 className="text-2xl text-center mb-4 underline">Includes</h3>

          <ul className="space-y-3 list-disc marker:text-red-400 pl-4">
            {deal.includes.map((included, index) => (
              <li key={index}>
                <Included text={included} />
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <a href="#book-session">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 rounded-none"
              >
                Book Now
              </Button>
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Bundle;
