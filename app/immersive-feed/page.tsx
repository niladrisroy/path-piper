import Navbar from "@/components/navbar"
import DesktopImmersiveFeed from "@/components/feed/desktop-immersive-feed"

export default function ImmersiveFeedPage() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-16">
        <DesktopImmersiveFeed />
      </div>
    </div>
  )
}
