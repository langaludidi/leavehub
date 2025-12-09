import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      {/* Hero Section */}
      <section className="bg-teal-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <span className="text-sm font-medium">
                🇿🇦 Built for South African Businesses
              </span>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Leave Management for
              <br />
              South African Businesses
            </h1>

            {/* Subheading */}
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Role-based access. BCEA compliance support. Essential reporting. Simplify
              leave management for your business with an easy-to-use platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-teal-600 hover:bg-gray-50 px-8"
                >
                  Try Demo →
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8"
                >
                  View Features
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Demo accounts available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Easy to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>BCEA compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage leave
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">BCEA Compliant</h3>
              <p className="text-gray-600">
                Fully aligned with South African labour law requirements
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save 75% Time</h3>
              <p className="text-gray-600">
                Streamline leave management processes
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted by 1000+</h3>
              <p className="text-gray-600">
                South African companies already use LeaveHub
              </p>
            </Card>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
