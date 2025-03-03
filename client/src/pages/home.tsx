import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
          <Music2 className="w-16 h-16 mb-4" />
          <h1 className="text-5xl font-bold mb-8">H Music Studio</h1>
          <div className="flex gap-4">
            <Link href="/booking">
              <Button size="lg" className="text-lg">
                예약하기
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="text-lg text-black bg-white hover:bg-gray-100">
                관리자
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="bg-white/10 text-white border-none">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">연습실 예약하기</h2>
              <ol className="space-y-2">
                <li>1. 입금 후 고객정보 및 시간 선택 후 예약하기(예약자 성함)</li>
                <li>2. 관리자가 확인 후 안내문자 발송</li>
                <li>3. 안내문자(비밀번호, 사용법 등) 확인 후 사용</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-white/10 text-white border-none">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">가격표</h2>
              <ul className="space-y-2">
                <li>1시간 - 5,000원</li>
                <li>2시간 - 9,000원</li>
                <li>3시간 - 13,000원</li>
                <li>10시간 - 40,000원(분할사용)</li>
                <li>월 대여 가격문의</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 text-white border-none">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">연락처</h2>
              <p>Tel. 010-5027-5086</p>
              <p className="mt-2">당일예약은 문자로 문의주세요</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}