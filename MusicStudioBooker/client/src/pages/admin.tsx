import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Booking } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "예약 상태가 업데이트되었습니다",
      });
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "063103") {
      setIsAuthenticated(true);
    } else {
      toast({
        title: "비밀번호가 올바르지 않습니다",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-3xl font-bold mb-8">관리자 로그인</h1>
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const filteredBookings = selectedDate
    ? bookings.filter((booking) => booking.date === format(selectedDate, "yyyy-MM-dd"))
    : bookings;

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7, 11)}`;
    } else {
      return phoneNumber;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">예약 관리</h1>
        <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
          로그아웃
        </Button>
      </div>

      {/* 신규 예약 현황 섹션 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          신규 예약 현황
          {pendingBookings.length > 0 && (
            <span className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded-full">
              {pendingBookings.length}
            </span>
          )}
        </h2>
        <div className="grid gap-4">
          {pendingBookings.length === 0 ? (
            <p className="text-gray-500">신규 예약이 없습니다.</p>
          ) : (
            pendingBookings.map((booking) => (
              <Card key={booking.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{booking.customerName}</h3>
                      <p className="text-sm text-gray-600">{formatPhoneNumber(booking.phoneNumber)}</p>
                      <p className="text-sm">
                        {booking.date} {booking.startTime} ({booking.duration}시간)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          statusMutation.mutate({ id: booking.id, status: "approved" })
                        }
                        disabled={statusMutation.isPending}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        예약승인
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          statusMutation.mutate({ id: booking.id, status: "rejected" })
                        }
                        disabled={statusMutation.isPending}
                      >
                        예약거절
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">날짜 선택</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedDate
              ? `${format(selectedDate, "yyyy년 MM월 dd일")} 예약 현황`
              : "전체 예약 현황"}
          </h2>
          <div className="grid gap-4">
            {filteredBookings.length === 0 ? (
              <p className="text-gray-500">예약이 없습니다.</p>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{booking.customerName}</h3>
                        <p className="text-sm text-gray-600">{formatPhoneNumber(booking.phoneNumber)}</p>
                        <p className="text-sm">
                          {booking.date} {booking.startTime} ({booking.duration}시간)
                        </p>
                        <p className="text-sm font-medium mt-2">
                          상태:{" "}
                          <span
                            className={
                              booking.status === "approved"
                                ? "text-green-500"
                                : booking.status === "pending"
                                ? "text-yellow-500"
                                : "text-red-500"
                            }
                          >
                            {booking.status === "approved"
                              ? "승인됨"
                              : booking.status === "pending"
                              ? "승인 대기"
                              : "거절됨"}
                          </span>
                        </p>
                      </div>

                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              statusMutation.mutate({ id: booking.id, status: "approved" })
                            }
                            disabled={statusMutation.isPending}
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            예약승인
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              statusMutation.mutate({ id: booking.id, status: "rejected" })
                            }
                            disabled={statusMutation.isPending}
                          >
                            예약거절
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}