"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { userService, UserProfile } from "@/services/user.service"
import { useAuth } from "@/components/auth/auth-context"
import { User, Phone, Calendar, FileText, ArrowRight, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ProfileCompletionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProfileComplete: () => void
  forceOpen?: boolean
}

export function ProfileCompletionModal({ open, onOpenChange, onProfileComplete, forceOpen = false }: ProfileCompletionModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateofBirth: "",
    pandetails: "",
    address: "",
    adharcard: ""
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { refreshUser } = useAuth()

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
        pandetails: profileData.pandetails || "",
        address: profileData.address || "",
        adharcard: profileData.adharcard || ""
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
      await refreshUser() // Refresh auth context
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
  const steps = missingFields.length > 0 ? missingFields : ["complete"]
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSave()
    }
  }
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const renderStepContent = () => {
    const currentField = steps[currentStep]
    
    switch (currentField) {
      case "fullName":
        return (
          <div className="space-y-4">
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
        )
      case "phone":
        return (
          <div className="space-y-4">
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
        )
      case "dateofBirth":
        return (
          <div className="space-y-4">
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
        )
      case "pandetails":
        return (
          <div className="space-y-4">
            <Label htmlFor="pandetails" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PAN Details *
            </Label>
            <Input
              id="pandetails"
              value={formData.pandetails}
              onChange={(e) => setFormData(prev => ({ ...prev, pandetails: e.target.value }))}
              placeholder="AAAAA9999A"
            />
          </div>
        )
      case "address":
        return (
          <div className="space-y-4">
            <Label htmlFor="address" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Address *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter your address"
            />
          </div>
        )
      case "adharcard":
        return (
          <div className="space-y-4">
            <Label htmlFor="adharcard" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Aadhaar Card Number *
            </Label>
            <Input
              id="adharcard"
              value={formData.adharcard}
              onChange={(e) => setFormData(prev => ({ ...prev, adharcard: e.target.value }))}
              placeholder="XXXX-XXXX-XXXX"
            />
          </div>
        )
      default:
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Profile Complete!</h3>
            <p className="text-gray-600">All required fields have been filled</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={forceOpen ? () => {} : onOpenChange}>
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
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                Complete your profile to continue using the system
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between gap-3">
              {steps.map((step, index) => {
                const isActive = index <= currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <React.Fragment key={index}>
                    <div className="relative">
                      <div
                        className={`w-8 h-8 flex items-center justify-center shrink-0 border-2 rounded-full font-semibold text-xs relative z-10 transition-colors duration-300 ${
                          isActive
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-300 text-gray-300"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {isCompleted ? (
                            <motion.svg
                              key="check"
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth="0"
                              viewBox="0 0 16 16"
                              height="1em"
                              width="1em"
                              xmlns="http://www.w3.org/2000/svg"
                              initial={{ rotate: 180, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: -180, opacity: 0 }}
                              transition={{ duration: 0.125 }}
                            >
                              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"></path>
                            </motion.svg>
                          ) : (
                            <motion.span
                              key="number"
                              initial={{ rotate: 180, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: -180, opacity: 0 }}
                              transition={{ duration: 0.125 }}
                            >
                              {index + 1}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      {isActive && (
                        <div className="absolute z-0 -inset-1.5 bg-indigo-100 rounded-full animate-pulse" />
                      )}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className="flex-1 h-1 rounded-full bg-gray-200 relative">
                        <motion.div
                          className="absolute top-0 bottom-0 left-0 bg-indigo-600 rounded-full"
                          animate={{ width: isCompleted ? "100%" : "0%" }}
                          transition={{ ease: "easeIn", duration: 0.3 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="min-h-[120px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0 || saving}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? "Complete Profile" : "Next"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}