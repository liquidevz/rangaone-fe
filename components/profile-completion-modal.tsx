"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { userService, UserProfile } from "@/services/user.service"
import { User, Phone, Calendar, FileText } from "lucide-react"

interface ProfileCompletionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProfileComplete: () => void
}

export function ProfileCompletionModal({ open, onOpenChange, onProfileComplete }: ProfileCompletionModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateofBirth: "",
    pnadetails: ""
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    console.log("ProfileCompletionModal - open state:", open);
    if (open) {
      console.log("ProfileCompletionModal - loading profile...");
      loadProfile()
    }
  }, [open])

  const loadProfile = async () => {
    try {
      console.log("ProfileCompletionModal - loading profile data...");
      setLoading(true)
      const profileData = await userService.getProfile()
      console.log("ProfileCompletionModal - profile data loaded:", profileData);
      setProfile(profileData)
      setFormData({
        fullName: profileData.fullName || "",
        phone: profileData.phone || "",
        dateofBirth: profileData.dateofBirth || "",
        pnadetails: profileData.pnadetails || ""
      })
      console.log("ProfileCompletionModal - form data set:", {
        fullName: profileData.fullName || "",
        phone: profileData.phone || "",
        dateofBirth: profileData.dateofBirth || "",
        pnadetails: profileData.pnadetails || ""
      });
    } catch (error) {
      console.error("ProfileCompletionModal - failed to load profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validate that all missing fields are filled
    const missingFieldsToFill = missingFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return !value || value.trim() === '';
    });

    if (missingFieldsToFill.length > 0) {
      toast({
        title: "Incomplete Profile",
        description: `Please fill in all required fields: ${missingFieldsToFill.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true)
      await userService.updateProfile(formData)
      toast({
        title: "Profile Updated",
        description: "Your profile has been completed successfully"
      })
      onProfileComplete()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const missingFields = profile?.missingFields || []

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Complete Your Profile to Continue
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 font-medium">
                Profile completion is required to proceed with checkout
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Please complete the following required fields:
            </p>
            
            {missingFields.includes("fullName") && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {missingFields.includes("phone") && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>
            )}

            {missingFields.includes("dateofBirth") && (
              <div className="space-y-2">
                <Label htmlFor="dateofBirth" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth *
                </Label>
                <Input
                  id="dateofBirth"
                  type="date"
                  value={formData.dateofBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateofBirth: e.target.value }))}
                />
              </div>
            )}

            {missingFields.includes("pnadetails") && (
              <div className="space-y-2">
                <Label htmlFor="pnadetails" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PAN Details
                </Label>
                <Input
                  id="pnadetails"
                  value={formData.pnadetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, pnadetails: e.target.value }))}
                  placeholder="AAAAA9999A"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Complete Profile & Continue"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}