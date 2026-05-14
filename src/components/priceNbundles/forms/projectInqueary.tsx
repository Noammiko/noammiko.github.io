import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import type { ReactNode } from "react"

const servicesSchema = z.object({
  vocalRecording: z.boolean(),
  instrumentRecording: z.boolean(),
  mixing: z.boolean(),
  mastering: z.boolean(),
  production: z.boolean(),
  other: z.boolean(),
})

const formSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  artistName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().min(6, "Phone is required"),
  projectType: z.string().min(1, "Please select a project type"),
  otherProjectType: z.string().optional(),
  services: servicesSchema.refine(
    (v) => Object.values(v).some(Boolean),
    { message: "Please select at least one service" }
  ),
  otherService: z.string().optional(),
  songCount: z.number().min(1, "Song count is required"),
  projectGoal: z.string().optional(),
  completionDate: z.string().min(1, "Completion date is required"),
  budget: z.string().min(1, "Budget is required"),
})

export interface Props {
  children: ReactNode
}

export default function ProjectInquiryModal({ children }: Props) {
  const func = useMutation(api.forms.inquary)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      artistName: "",
      email: "",
      phone: "",
      projectType: "",
      otherProjectType: "",
      services: {
        vocalRecording: false,
        instrumentRecording: false,
        mixing: false,
        mastering: false,
        production: false,
        other: false,
      },
      otherService: "",
      songCount: 1,
      projectGoal: "",
      completionDate: "",
      budget: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values)
    func({
      fullName: values.fullName,
      artistName: values.artistName,
      email: values.email,
      phone: values.phone,
      projectType: values.projectType,
      otherProjectType: values.otherProjectType,
      services: {
        vocalRecording: values.services.vocalRecording,
        instrumentRecording: values.services.instrumentRecording,
        drumKitRecording: false,
        mixing: values.services.mixing,
        mastering: values.services.mastering,
        production: values.services.production,
        other: values.services.other,
      },
      otherService: values.otherService,
      songCount: values.songCount,
      projectGoal: values.projectGoal,
      completionDate: values.completionDate,
      budget: values.budget,
    }).then(() => {
      form.reset();
      window.location.replace("/prices-and-bundles#contact");
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="text-cream sm:max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-background border border-gold/20">
        <DialogHeader>
          <DialogTitle className="font-bentham text-gold text-xl tracking-wide">
            Full Project Inquiry – Miko Recording Studio
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <h3 className="text-base font-jose font-semibold mb-2 text-gold/90">
                Ready to take your music to the next level?
              </h3>
              <p className="text-cream/70 font-jose text-sm">
                Fill out this form to tell me about your project — whether it's an EP, album, or something else. I'll
                review your submission and reach out to discuss the best way to bring your vision to life.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <FormPage form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}

interface FormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  form: UseFormReturn<z.infer<typeof formSchema>>
}

const inputClass = "bg-[#181818] border-gold/20 text-cream placeholder:text-cream/30 focus-visible:border-gold/50 focus-visible:ring-gold/20"
const labelClass = "font-jose text-cream/80 text-sm"
const sectionLabelClass = "font-jose text-cream font-medium"

function FormPage({ onSubmit, form }: FormProps) {
  const projectType = form.watch("projectType")
  const services = form.watch("services")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                Full Name <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <Input className={inputClass} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="artistName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Artist/Band Name</FormLabel>
              <FormControl>
                <Input className={inputClass} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                Email Address <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <Input type="email" className={inputClass} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                Phone Number <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <Input type="tel" className={inputClass} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Type */}
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                What type of project are you working on? <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-2 gap-3 mt-1"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  {["Single", "EP", "Album", "Voiceover", "Podcast", "Other"].map((val) => (
                    <FormItem key={val} className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value={val} className="border-gold/40 text-gold" />
                      </FormControl>
                      <FormLabel className={labelClass}>{val}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
              {projectType === "Other" && (
                <FormField
                  control={form.control}
                  name="otherProjectType"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel className={labelClass}>Please specify</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="Describe your project type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </FormItem>
          )}
        />

        {/* Services */}
        <FormField
          control={form.control}
          name="services"
          render={() => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                What services do you need? (Check all that apply) <span className="text-crimson">*</span>
              </FormLabel>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <FormField
                  control={form.control}
                  name="services.vocalRecording"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="vocalRecording"
                          className="border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                      </FormControl>
                      <FormLabel htmlFor="vocalRecording" className={labelClass}>
                        Vocal Recording
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.instrumentRecording"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="instrumentRecording"
                          className="border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                      </FormControl>
                      <FormLabel htmlFor="instrumentRecording" className={labelClass}>
                        Instrument Recording (Guitar, Bass, Saxophone etc.)
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.mixing"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="mixing"
                          className="border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                      </FormControl>
                      <FormLabel htmlFor="mixing" className={labelClass}>
                        Mixing
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.mastering"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="mastering"
                          className="border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                      </FormControl>
                      <FormLabel htmlFor="mastering" className={labelClass}>
                        Mastering
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.production"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="production"
                          className="border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                      </FormControl>
                      <FormLabel htmlFor="production" className={labelClass}>
                        Production (Beats/Instrumentals)
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.other"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="other"
                          className="border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                      </FormControl>
                      <FormLabel htmlFor="other" className={labelClass}>
                        Other
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {services?.other && (
                  <FormField
                    control={form.control}
                    name="otherService"
                    render={({ field }) => (
                      <FormItem className="col-span-2 mt-2">
                        <FormLabel className={labelClass}>Please specify</FormLabel>
                        <FormControl>
                          <Input className={inputClass} placeholder="Please specify" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="songCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                Roughly how many songs will be on this project? <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="e.g., 6" className={inputClass} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                What's your goal with this project?
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your vision, goals, and what you hope to achieve with this project"
                  rows={3}
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="completionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                When would you ideally like to have this project completed by? <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., End of summer, October, Within 3 months, etc."
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Budget */}
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                What is your estimated budget for this project? <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="space-y-3 mt-1"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  {[
                    "Under $500",
                    "$500 - $1000",
                    "$1000 - $1500",
                    "$1500 - $2000",
                    "$2000+",
                    "Not sure yet / Let's Talk",
                  ].map((val) => (
                    <FormItem key={val} className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value={val === "Not sure yet / Let's Talk" ? "Not sure yet / Lets Talk" : val} className="border-gold/40 text-gold" />
                      </FormControl>
                      <FormLabel className={labelClass}>{val}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 border-t border-gold/20">
          <Button
            type="submit"
            className="w-full btn-crimson font-jose font-bold py-3 rounded text-sm tracking-wide"
          >
            Submit Project Inquiry
          </Button>
        </div>
      </form>
    </Form>
  )
}
