import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";
import type { Booking } from "@shared/schema";

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertBookingSchema.extend({
      customerName: insertBookingSchema.shape.customerName.min(1, "이름을 입력해주세요"),
      phoneNumber: insertBookingSchema.shape.phoneNumber.min(1, "전화번호를 입력해주세요"),
    })),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      date: "",
      startTime: "",
      duration: 1
    }
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings", selectedDate?.toISOString()],
    enabled: !!selectedDate
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      toast({
        title: "예약 신청 완료",
        description: "관리자 승인 후 안내문자가 발송됩니다."
      });
      form.reset();
      setSelectedTimes([]);
    }
  });

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const getTimeStatus = (time: string) => {
    const booking = bookings.find(b => {
      const startTimeIndex = timeSlots.indexOf(b.startTime);
      const endTimeIndex = startTimeIndex + (b.duration * 2);
      const currentTimeIndex = timeSlots.indexOf(time);
      return currentTimeIndex >= startTimeIndex && currentTimeIndex < endTimeIndex &&
             b.date === format(selectedDate!, "yyyy-MM-dd");
    });
    return booking?.status;
  };

  const handleTimeSelect = (time: string) => {
    const timeIndex = timeSlots.indexOf(time);
    const timeStatus = getTimeStatus(time);

    if (timeStatus) {
      return; // 이미 예약된 시간은 선택 불가
    }

    if (selectedTimes.includes(time)) {
      // 선택 해제 시, 해당 시간과 그 이후의 시간들만 해제
      const newSelectedTimes = selectedTimes.filter(t => timeSlots.indexOf(t) < timeIndex);
      setSelectedTimes(newSelectedTimes);
    } else {
      // 선택 시, 연속된 시간만 선택 가능
      if (selectedTimes.length === 0 ||
          timeIndex === timeSlots.indexOf(selectedTimes[selectedTimes.length - 1]) + 1) {
        // 다음 시간이 예약 가능한지 확인
        if (!getTimeStatus(time)) {
          setSelectedTimes([...selectedTimes, time]);
        }
      } else {
        toast({
          title: "연속된 시간만 선택 가능합니다",
          variant: "destructive"
        });
      }
    }
  };

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");
    // xxx-xxxx-xxxx 형식으로 변환
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const getBookingValidationMessage = () => {
    if (!selectedDate) {
      return "날짜를 선택해주세요";
    }
    if (selectedTimes.length === 0) {
      return "예약 시간을 선택해주세요";
    }
    if (selectedTimes.length % 2 !== 0) {
      return "예약은 1시간 단위로 해주세요";
    }
    return null;
  };

  const onSubmit = (data: any) => {
    const validationMessage = getBookingValidationMessage();
    if (validationMessage) {
      toast({
        title: validationMessage,
        variant: "destructive"
      });
      return;
    }

    bookingMutation.mutate({
      ...data,
      date: format(selectedDate!, "yyyy-MM-dd"),
      startTime: selectedTimes[0],
      duration: selectedTimes.length / 2
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">연습실 예약</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedTimes([]); // 날짜 변경시 선택된 시간 초기화
            }}
            disabled={{ before: addDays(new Date(), 1) }}
            className="rounded-md border"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름 *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호 *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        if (formatted.length <= 13) { // xxx-xxxx-xxxx 형식의 최대 길이
                          field.onChange(formatted);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>예약 시간</FormLabel>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {timeSlots.map((time) => {
                  const status = getTimeStatus(time);
                  let variant: "default" | "outline" | "secondary" = selectedTimes.includes(time) ? "default" : "outline";
                  let disabled = false;
                  let statusText = "";

                  if (status === "pending") {
                    variant = "secondary";
                    disabled = true;
                    statusText = "예약 승인 대기";
                  } else if (status === "approved") {
                    variant = "secondary";
                    disabled = true;
                    statusText = "예약 완료";
                  }

                  return (
                    <Button
                      key={time}
                      type="button"
                      variant={variant}
                      onClick={() => handleTimeSelect(time)}
                      disabled={disabled}
                      className="w-full relative group"
                    >
                      {time}
                      {statusText && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          {statusText}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {getBookingValidationMessage() && (
              <div className="text-sm text-red-500">
                {getBookingValidationMessage()}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={bookingMutation.isPending || !!getBookingValidationMessage()}
            >
              예약하기
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}