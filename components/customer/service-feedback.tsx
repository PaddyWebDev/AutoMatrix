"use client";

import React, { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { feedbackSchema, FeedbackFormData } from '@/lib/validations/feedback';
import { Input } from '../ui/input';
import { handleFiledUpload } from '@/hooks/customer';

interface ServiceFeedbackProps {
  appointmentId: string;
  serviceCenterName: string;
  onFeedbackSubmitted?: () => void;
}

export default function ServiceFeedback({ appointmentId, serviceCenterName, onFeedbackSubmitted }: ServiceFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      attachments: []
    },
  });

  const rating = form.watch('rating');

  const handleStarClick = (starRating: number) => {
    form.setValue('rating', starRating);
  };

  const onSubmit = async (data: FeedbackFormData) => {
    startTransition(async () => {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}/feedback`, {
          appointmentId,
          rating: data.rating,
          comment: data.comment?.trim() || null,
        });
        toast.success('Feedback submitted successfully!');
        setIsOpen(false);
        form.reset();
        onFeedbackSubmitted?.();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Failed to submit feedback');
        } else {
          toast.error('An error occurred');
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Give Feedback</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Your Service Experience</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-base font-medium">Service Center: {serviceCenterName}</Label>
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Rating</FormLabel>
                  <FormControl>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          className="focus:outline-none"
                          disabled={isPending}
                        >
                          <Star
                            className={`h-8 w-8 ${star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <p className="text-sm text-gray-600 mt-1">
                    {rating === 0 ? 'Select a rating' : `${rating} star${rating > 1 ? 's' : ''}`}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with the service..."
                      {...field}
                      rows={4}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Attachments (Optional)"}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isPending}
                      onChange={(e) =>
                        handleFiledUpload(field, e)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
