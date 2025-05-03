"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"

import reviews from "@/assets/reviews.json";

const reviewList = reviews.map((review) => ({
  ...review,
  date: new Date(review.date),
}));

// This type will be used when you import actual Google reviews
interface ReviewType {
  id: string
  author: string
  rating: number
  text: string
  date: string
  photoUrl?: string
}

interface ReviewsSectionProps {
  title?: string
  subtitle?: string
}

export function ReviewsSection({ title = "REVIEWS", subtitle }: ReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)


  const goToPrevious = () => {
    const isFirstReview = currentIndex === 0
    const newIndex = isFirstReview ? reviews.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastReview = currentIndex === reviews.length - 1
    const newIndex = isLastReview ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  return (
    <div className="w-full py-8">
      <h2 className="text-4xl font-bold mb-4 border-b-2 border-red-500 pb-2 inline-block text-center">
        {title}
      </h2>
      {subtitle && <p className="text-xl text-center mb-8">{subtitle}</p>}

      <div className="max-w-4xl mx-auto">
        <div className="relative bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-red-500/30 hover:border-red-500/50 transition">
          {/* Google Reviews Badge */}
          <a
            href="https://www.google.com/maps?q=Miko+Recording+Studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-300 hover:text-red-400 underline"
          >
            <div className="absolute -top-5 right-8 bg-white text-black px-4 py-1 rounded-full flex items-center shadow-lg">
              <Icon icon="flat-color-icons:google" width={24} height={24} className="mr-2" />
              <span className="font-semibold">Google Reviews</span>
            </div>
          </a>

          <div className="flex flex-col items-center">

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 pb-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-black/30 hover:bg-black/50 border-none text-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-red-500" : "bg-gray-500"}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-black/30 hover:bg-black/50 border-none text-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Current Review */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${i < reviewList[currentIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
                  />
                ))}
              </div>

              <div className="relative">
                <Quote className="absolute -top-4 -left-4 h-8 w-8 text-red-500/30" />
                <p className="text-xl italic mb-6 px-6">{reviewList[currentIndex].text}</p>
                <Quote className="absolute -bottom-4 -right-4 h-8 w-8 text-red-500/30 transform rotate-180" />
              </div>

              <div className="flex items-center justify-center mt-6">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img
                    src={reviewList[currentIndex].image || "/albumPlaceholder.svg"}
                    alt={reviewList[currentIndex].name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold">{reviewList[currentIndex].name}</p>
                  {/* <p className="text-sm text-gray-400">{reviewList[currentIndex].date}</p> */}
                </div>
              </div>
            </div>
            <a
              href={reviewList[currentIndex].url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-300 hover:text-red-400 underline"
            >
              View review on Google
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
