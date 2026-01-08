"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, Car, Building } from "lucide-react";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import ViewFeedBackDetails from "@/components/admin/view-feedback-details";
import Image from "next/image";
import { FeedbackWithDetails } from "@/types/admin";


export default function AdminFeedbackPage() {


  const {
    data: feedback = [],
    isLoading,
    error,
  } = useQuery<FeedbackWithDetails[]>({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/feedback`);
      return res.data.feedback_data ?? [];
    },
  });



  if (isLoading) return <Loader />;
  if (error) return <TanstackError />;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Feedback</h1>
        <Badge variant="secondary" className="text-sm">
          {feedback.length} Total Feedback
        </Badge>
      </div>

      {feedback.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No feedback available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feedback.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {renderStars(item.rating)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.rating}/5
                  </Badge>
                </div>
                <CardTitle className="text-lg">
                  {item.appointment.serviceType}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.comment && (
                  <p className="text-sm text-muted-foreground italic">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.appointment.owner.name}</span>
                    <span className="text-muted-foreground">
                      ({item.appointment.owner.email})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{item.appointment.Vehicle.vehicleName}</span>
                    <span className="text-muted-foreground">
                      ({item.appointment.Vehicle.numberPlate})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{item.appointment.serviceCenter.name}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Submitted on {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {item.attachments.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium mb-1">Attachments:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.attachments.map((attachment, index) => (
                        <Image key={index} src={attachment} width={200} height={200} alt={`Attachment Image ${index}`} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t flex gap-2">
                  <ViewFeedBackDetails selectedFeedback={item} renderStars={renderStars} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
