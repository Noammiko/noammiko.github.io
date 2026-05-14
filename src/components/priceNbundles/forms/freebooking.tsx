import { z } from "zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full Name is required." }),
  artistName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().min(6, { message: "Phone is required." }),
  availableTimes: z.string().min(5, { message: "Please provide at least 3 times." }),
  recordingType: z.string().min(1, { message: "Please select a recording type." }),
  otherRecordingType: z.string().optional(),
  referralSource: z.string().min(1, { message: "Please select a referral source." }),
  otherReferralSource: z.string().optional(),
})

export interface Props {
  children: ReactNode
}

export default function BookingFormModal({ children }: Props) {
  const func = useMutation(api.forms.freeTrial)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      artistName: "",
      email: "",
      phone: "",
      availableTimes: "",
      recordingType: "",
      otherRecordingType: "",
      referralSource: "",
      otherReferralSource: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values)
    func({
      fullName: values.fullName,
      artistName: values.artistName,
      email: values.email,
      phone: values.phone,
      availableTimes: values.availableTimes,
      recordingType: values.recordingType,
      otherRecordingType: values.otherRecordingType,
      referralSource: values.referralSource,
      otherReferralSource: values.otherReferralSource,
    }).then(() => {
      form.reset();
      history.pushState(null, "", "/prices-and-bundles/thank-you");
      window.location.reload();
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
            First-Time Tryout Session
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <h3 className="text-base font-jose font-semibold mb-2 text-gold/90">
                Claim your FREE 30-minute tryout session
              </h3>
              <p className="text-cream/70 font-jose text-sm mb-3">
                Includes studio time, a 30-second clip of your song, and a basic mix. This is for new clients only.
                Limited spots each week.
              </p>
              <p className="text-cream/70 font-jose text-sm">
                Please fill out the short form below to apply. We'll reach out to confirm your booking.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <BookingForm form={form} onSubmit={onSubmit} />
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

function BookingForm({ onSubmit, form }: FormProps) {
  const recordingType = form.watch("recordingType")
  const referralSource = form.watch("referralSource")

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
              <FormLabel className={labelClass}>Artist Name (if applicable)</FormLabel>
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
                Email <span className="text-crimson">*</span>
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

        <FormField
          control={form.control}
          name="availableTimes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                Please indicate at least 3 times that work for you this week <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Example: Tuesday, May 20th at 6:30PM"
                  rows={3}
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recording Type */}
        <FormField
          control={form.control}
          name="recordingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                What would you like to record during your session? <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-2 gap-3 mt-1"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  {["Original Song", "Cover", "Parody", "Freestyle", "Other"].map((val) => (
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
              {recordingType === "Other" && (
                <FormField
                  control={form.control}
                  name="otherRecordingType"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel className={labelClass}>Please specify</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="Describe what you'd like to record" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </FormItem>
          )}
        />

        {/* Referral Source */}
        <FormField
          control={form.control}
          name="referralSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={sectionLabelClass}>
                How did you hear about us? <span className="text-crimson">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-2 gap-3 mt-1"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  {["Instagram", "Tiktok", "Google search/maps", "Referral", "Ads", "Other"].map((val) => (
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
              {referralSource === "Other" && (
                <FormField
                  control={form.control}
                  name="otherReferralSource"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel className={labelClass}>Please specify</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="How did you hear about us?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </FormItem>
          )}
        />

        <div className="pt-4 border-t border-gold/20">
          <Button
            type="submit"
            className="w-full btn-gold font-jose font-bold py-3 rounded text-sm tracking-wide"
          >
            Submit Booking Request
          </Button>
        </div>
      </form>
    </Form>
  )
}
