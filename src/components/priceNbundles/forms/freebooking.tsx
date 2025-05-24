import { z } from "zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, type ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
      <DialogContent className="text-white sm:max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-background border-background" >
        <DialogHeader>
          <DialogTitle>First-Time Tryout Session</DialogTitle>
          <DialogDescription asChild>
            <div>
              <h3 className="text-lg font-jose font-semibold mb-2">Claim your FREE 30-minute tryout session</h3>
              <p className="text-gray-300 mb-4">
                Includes studio time, a 30-second clip of your song, and a basic mix. This is for new clients only.
                Limited spots each week.
              </p>
              <p className="text-gray-300">
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

function BookingForm({ onSubmit, form }: FormProps) {
  // Watch for conditional fields
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
              <FormLabel>
                Full Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Artist Name (if applicable)</FormLabel>
              <FormControl>
                <Input {...field} />
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
                Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="email" {...field} />
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
                <Input type="tel" {...field} />
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
              <FormLabel>
                Please indicate at least 3 times that work for you this week <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Example: Tuesday, May 20th at 6:30PM"
                  rows={3}
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
              <FormLabel>What would you like to record during your session?</FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-2 gap-4"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Original Song" />
                    </FormControl>
                    <FormLabel className="font-normal">Original Song</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Cover" />
                    </FormControl>
                    <FormLabel className="font-normal">Cover</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Parody" />
                    </FormControl>
                    <FormLabel className="font-normal">Parody</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Freestyle" />
                    </FormControl>
                    <FormLabel className="font-normal">Freestyle</FormLabel>
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
              {recordingType === "Other" && (
                <FormField
                  control={form.control}
                  name="otherRecordingType"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Please specify</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe what you'd like to record" {...field} />
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
              <FormLabel>
                How did you hear about us? <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-2 gap-4"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Instagram" />
                    </FormControl>
                    <FormLabel className="font-normal">Instagram</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Tiktok" />
                    </FormControl>
                    <FormLabel className="font-normal">Tiktok</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Google search/maps" />
                    </FormControl>
                    <FormLabel className="font-normal">Google search/maps</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Referral" />
                    </FormControl>
                    <FormLabel className="font-normal">Referral</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Ads" />
                    </FormControl>
                    <FormLabel className="font-normal">Ads</FormLabel>
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
              {referralSource === "Other" && (
                <FormField
                  control={form.control}
                  name="otherReferralSource"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Please specify</FormLabel>
                      <FormControl>
                        <Input placeholder="How did you hear about us?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </FormItem>
          )}
        />

        <div className="pt-4 border-t border-gray-800">
          <Button
            type="submit"
            className="w-full bg-yellow-500 text-black font-bold py-3 rounded hover:bg-yellow-600 transition-colors focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Submit Booking Request
          </Button>
        </div>
      </form>
    </Form>
  )
}
