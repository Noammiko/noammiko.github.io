import { zodResolver } from "@hookform/resolvers/zod"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

const servicesSchema = z.object({
  vocalRecording: z.boolean(),
  instrumentRecording: z.boolean(),
  drumKitRecording: z.boolean(),
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
  songCount: z.string().min(1, "Song count is required"),
  projectGoal: z.string().optional(),
  completionDate: z.string().min(1, "Completion date is required"),
  budget: z.string().min(1, "Budget is required"),
})

interface ProjectInquiryModalProps {
}

export default function ProjectInquiryModal({ }: ProjectInquiryModalProps) {
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
        drumKitRecording: false,
        mixing: false,
        mastering: false,
        production: false,
        other: false,
      },
      otherService: "",
      songCount: "",
      projectGoal: "",
      completionDate: "",
      budget: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Send form data to backend here
    console.log("Form submitted:", values)
    alert("Thank you! Your project inquiry has been submitted. We'll contact you soon to discuss your project.")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="text-white sm:max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-background border-background" >
        <DialogHeader>
          <DialogTitle>Full Project Inquiry – Miko Recording Studio</DialogTitle>
          <DialogDescription asChild>
            <div>
              <h3 className="text-lg font-jose font-semibold mb-2">Ready to take your music to the next level?</h3>
              <p className="text-gray-300">
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

function FormPage({ onSubmit, form }: FormProps) {
  const projectType = form.watch("projectType")
  const services = form.watch("services")
  // const budget = form.watch("budget")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Full Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Your legal name" {...field} />
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
              <FormLabel>Artist/Band Name</FormLabel>
              <FormControl>
                <Input placeholder="Your artist/band name" {...field} />
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
              <FormLabel>
                Email Address <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@email.com" {...field} />
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
              <FormLabel>
                Phone Number <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 123-4567" {...field} />
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
              <FormLabel>
                What type of project are you working on? <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-2 gap-4"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Single" />
                    </FormControl>
                    <FormLabel className="font-normal">Single</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="EP" />
                    </FormControl>
                    <FormLabel className="font-normal">EP</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Album" />
                    </FormControl>
                    <FormLabel className="font-normal">Album</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Voiceover" />
                    </FormControl>
                    <FormLabel className="font-normal">Voiceover</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Podcast" />
                    </FormControl>
                    <FormLabel className="font-normal">Podcast</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Other" />
                    </FormControl>
                    <FormLabel className="font-normal">Other</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
              {projectType === "Other" && (
                <FormField
                  control={form.control}
                  name="otherProjectType"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Please specify</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe your project type" {...field} />
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
              <FormLabel>
                What services do you need? (Check all that apply) <span className="text-red-500">*</span>
              </FormLabel>
              <div className="grid grid-cols-2 gap-4">
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
                        />
                      </FormControl>
                      <FormLabel htmlFor="vocalRecording" className="font-normal">
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
                        />
                      </FormControl>
                      <FormLabel htmlFor="instrumentRecording" className="font-normal">
                        Instrument recording (Guitar, Bass, Saxophone etc.)
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.drumKitRecording"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="drumKitRecording"
                        />
                      </FormControl>
                      <FormLabel htmlFor="drumKitRecording" className="font-normal">
                        Drum Kit Recording
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
                        />
                      </FormControl>
                      <FormLabel htmlFor="mixing" className="font-normal">
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
                        />
                      </FormControl>
                      <FormLabel htmlFor="mastering" className="font-normal">
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
                        />
                      </FormControl>
                      <FormLabel htmlFor="production" className="font-normal">
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
                        />
                      </FormControl>
                      <FormLabel htmlFor="other" className="font-normal">
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
                        <FormLabel>Please specify</FormLabel>
                        <FormControl>
                          <Input placeholder="Please specify" {...field} />
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
              <FormLabel>
                Roughly how many songs will be on this project? <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., 6" {...field} />
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
              <FormLabel>
                What's your goal with this project?
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your vision, goals, and what you hope to achieve with this project"
                  rows={3}
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
              <FormLabel>
                When would you ideally like to have this project completed by? <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., End of summer, October 2025, Within 3 months, etc."
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
              <FormLabel>
                What is your estimated budget for this project? <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="space-y-3"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Under $500" />
                    </FormControl>
                    <FormLabel className="font-normal">Under $500</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="$500 - $1000" />
                    </FormControl>
                    <FormLabel className="font-normal">$500 - $1000</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="$1000 - $1500" />
                    </FormControl>
                    <FormLabel className="font-normal">$1000 - $1500</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="$1500 - $2000" />
                    </FormControl>
                    <FormLabel className="font-normal">$1500 - $2000</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="$2000+" />
                    </FormControl>
                    <FormLabel className="font-normal">$2000+</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Not sure yet / Lets Talk" />
                    </FormControl>
                    <FormLabel className="font-normal">Not sure yet / Let's Talk</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 border-t border-gray-800">
          <Button
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Submit Project Inquiry
          </Button>
        </div>
      </form>
    </Form>
  )
}
