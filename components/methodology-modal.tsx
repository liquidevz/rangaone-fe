"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Youtube, Download, ExternalLink } from "lucide-react"
import { portfolioService } from "@/services/portfolio.service"
import { useToast } from "@/components/ui/use-toast"

interface MethodologyModalProps {
  isOpen: boolean
  onClose: () => void
  portfolioId: string
  portfolioName: string
}

interface DownloadLink {
  linkType: string
  linkUrl?: string
  url?: string
  linkDiscription?: string
  name?: string
  _id: string
  createdAt: string
}

interface YoutubeLink {
  link: string
  createdAt: string
}

export function MethodologyModal({ isOpen, onClose, portfolioId, portfolioName }: MethodologyModalProps) {
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([])
  const [youTubeLinks, setYouTubeLinks] = useState<YoutubeLink[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchMethodologyData = async () => {
    if (!portfolioId) return
    
    setLoading(true)
    try {
      const { downloadLinks: dLinks, youTubeLinks: yLinks } = await portfolioService.getMethodologyLinks(portfolioId)
      setDownloadLinks(dLinks || [])
      setYouTubeLinks(yLinks || [])
    } catch (error) {
      console.error("Failed to fetch methodology data:", error)
      toast({
        title: "Error",
        description: "Failed to load methodology data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (open: boolean) => {
    if (open && portfolioId) {
      fetchMethodologyData()
    } else {
      onClose()
    }
  }

  const openLink = (url: string) => {
    window.open(url, '_blank')
  }

  const getFileName = (link: DownloadLink): string => {
    if (link.name) return link.name
    if (link.linkDiscription) return link.linkDiscription
    if (link.linkType) return `${link.linkType.toUpperCase()} Document`
    return "Document"
  }

  const getFileUrl = (link: DownloadLink): string => {
    return link.linkUrl || link.url || ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Methodology - {portfolioName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Download Links Section */}
            {downloadLinks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Research Documents
                </h3>
                <div className="space-y-2">
                  {downloadLinks.map((link) => (
                    <div
                      key={link._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{getFileName(link)}</p>
                          <p className="text-xs text-gray-500">
                            {link.linkType?.toUpperCase() || 'PDF'} • {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openLink(getFileUrl(link))}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Links Section */}
            {youTubeLinks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  Video Resources
                </h3>
                <div className="space-y-2">
                  {youTubeLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Youtube className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium text-sm">Portfolio Methodology Video</p>
                          <p className="text-xs text-gray-500">
                            YouTube • {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openLink(link.link)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Watch
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Content Message */}
            {!loading && downloadLinks.length === 0 && youTubeLinks.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No methodology resources available for this portfolio.</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 