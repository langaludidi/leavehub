import type { Metadata } from "next";
import { SwiftTipApp } from "@/components/swiftip/SwiftTipApp";

export const metadata: Metadata = {
  title: "SwiftTip — Digital Tipping for Fuel Station Workers",
  description:
    "SwiftTip makes it easy to tip fuel station workers via QR code, track earnings, and request instant payouts.",
};

export default function SwiftTipPage() {
  return <SwiftTipApp />;
}
