"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Calendar, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for videos
const videos = [
  {
    id: "1",
    title: "Understanding Market Trends: A Beginner's Guide",
    thumbnail: "/placeholder.svg?key=x8258",
    youtubeId: "dQw4w9WgXcQ",
    category: "Education",
    duration: "15:24",
    publishedDate: "May 15, 2023",
    author: "Rangaone Finwala",
    description:
      "Learn the basics of market trends and how to identify them in this comprehensive guide for beginners.",
    views: "12K",
  },
  {
    id: "2",
    title: "Top 5 Stocks to Watch This Quarter",
    thumbnail: "/stock-picks-thumbnail.png",
    youtubeId: "dQw4w9WgXcQ",
    category: "Stock Picks",
    duration: "22:10",
    publishedDate: "June 2, 2023",
    author: "Rangaone Finwala",
    description:
      "Our expert analysts share their top 5 stock picks for this quarter with detailed analysis and projections.",
    views: "8.5K",
  },
  {
    id: "3",
    title: "Technical Analysis Masterclass",
    thumbnail: "/technical-analysis-thumbnail.png",
    youtubeId: "dQw4w9WgXcQ",
    category: "Education",
    duration: "45:30",
    publishedDate: "April 28, 2023",
    author: "Rangaone Finwala",
    description: "Master the art of technical analysis with this comprehensive guide to chart patterns and indicators.",
    views: "15K",
  },
  {
    id: "4",
    title: "Monthly Market Outlook - July 2023",
    thumbnail: "/market-outlook-thumbnail.png",
    youtubeId: "dQw4w9WgXcQ",
    category: "Market Updates",
    duration: "18:45",
    publishedDate: "July 1, 2023",
    author: "Rangaone Finwala",
    description: "Get our expert analysis on market trends and opportunities for the month of July 2023.",
    views: "7.2K",
  },
  {
    id: "5",
    title: "Fundamental Analysis: How to Value Stocks",
    thumbnail: "/fundamental-analysis-thumbnail.png",
    youtubeId: "dQw4w9WgXcQ",
    category: "Education",
    duration: "32:15",
    publishedDate: "May 5, 2023",
    author: "Rangaone Finwala",
    description: "Learn how to perform fundamental analysis to determine the intrinsic value of stocks.",
    views: "10.8K",
  },
  {
    id: "6",
    title: "Investing for Retirement: Building a Secure Future",
    thumbnail: "/placeholder.svg?height=180&width=320&query=retirement investing video thumbnail",
    youtubeId: "dQw4w9WgXcQ",
    category: "Education",
    duration: "27:50",
    publishedDate: "June 15, 2023",
    author: "Rangaone Finwala",
    description: "Strategies for building a retirement portfolio that provides security and growth for your future.",
    views: "9.3K",
  },
  {
    id: "7",
    title: "Weekly Market Recap - Week 26, 2023",
    thumbnail: "/placeholder.svg?height=180&width=320&query=market recap video thumbnail",
    youtubeId: "dQw4w9WgXcQ",
    category: "Market Updates",
    duration: "12:30",
    publishedDate: "June 30, 2023",
    author: "Rangaone Finwala",
    description: "A recap of the major market movements and news from the past week.",
    views: "6.5K",
  },
  {
    id: "8",
    title: "Dividend Investing Strategies for Passive Income",
    thumbnail: "/placeholder.svg?height=180&width=320&query=dividend investing video thumbnail",
    youtubeId: "dQw4w9WgXcQ",
    category: "Education",
    duration: "24:18",
    publishedDate: "May 22, 2023",
    author: "Rangaone Finwala",
    description: "Learn how to build a dividend portfolio that generates consistent passive income.",
    views: "11.2K",
  },
]

export default function VideosForYou() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedVideo, setSelectedVideo] = useState(videos[0])

  const filteredVideos = videos.filter((video) => {
    if (activeTab === "all") return true
    return video.category.toLowerCase() === activeTab.toLowerCase()
  })

  const categories = ["all", ...new Set(videos.map((video) => video.category.toLowerCase()))]

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-6">
        <div className="bg-indigo-900 text-white py-6 px-8 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold text-center">Videos For You</h1>
          <p className="text-center mt-2">Educational content and market insights</p>
        </div>

        {/* Featured Video */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="aspect-video w-full bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {selectedVideo.author}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {selectedVideo.publishedDate}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {selectedVideo.duration}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {selectedVideo.category}
              </span>
            </div>
            <p className="text-gray-700">{selectedVideo.description}</p>
          </div>
        </div>

        {/* Video Library */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Video Library</h2>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full flex justify-start bg-gray-100 p-1 h-auto overflow-x-auto">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className={cn(
                      "py-2 px-4 rounded-md data-[state=active]:shadow-none capitalize",
                      activeTab === category
                        ? "data-[state=active]:bg-indigo-900 data-[state=active]:text-white"
                        : "data-[state=inactive]:bg-transparent",
                    )}
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={() => setSelectedVideo(video)}
                    isSelected={selectedVideo.id === video.id}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}

function VideoCard({ video, onClick, isSelected }) {
  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md",
        isSelected && "ring-2 ring-indigo-500",
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="bg-indigo-900 bg-opacity-80 rounded-full p-3">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{video.publishedDate}</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
              {video.category}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
