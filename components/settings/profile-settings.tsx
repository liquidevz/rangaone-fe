"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, AlertCircle, CheckCircle } from "lucide-react"
import { userService, UserProfile } from "@/services/user.service"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfileSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const data = await userService.getProfile()
        setProfile(data)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile information. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev!,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      const updatedProfile = await userService.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        dateofBirth: profile.dateofBirth,
        pnadetails: profile.pnadetails,
      })
      
      setProfile(updatedProfile)
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile information. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Loading profile information...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
        <p className="text-gray-600 mb-6">Update your personal information and complete your profile.</p>
        
        {/* Profile Completion Status */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {profile?.profileComplete ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
            <span className="font-medium">
              Profile {profile?.profileComplete ? 'Complete' : 'Incomplete'}
            </span>
            <Badge variant={profile?.profileComplete ? 'default' : 'secondary'}>
              {profile?.profileComplete ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>
          
          {!profile?.profileComplete && profile?.missingFields && profile.missingFields.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please complete the following fields: {profile.missingFields.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          
          {profile?.forceComplete && (
            <Alert className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Profile completion is required for your active subscription.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-400">
                  {profile?.fullName?.charAt(0) || profile?.username?.charAt(0) || "U"}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{profile?.email}</p>
            <p className="text-sm text-gray-600">@{profile?.username}</p>
            <p className="text-sm text-gray-600">Member since {new Date(profile?.createdAt || '').toLocaleDateString()}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={profile?.emailVerified ? 'default' : 'secondary'}>
                {profile?.emailVerified ? 'Email Verified' : 'Email Not Verified'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="md:w-2/3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                value={profile?.fullName || ""} 
                onChange={handleChange}
                className={profile?.missingFields?.includes('fullName') ? 'border-red-300' : ''}
              />
              {profile?.missingFields?.includes('fullName') && (
                <p className="text-xs text-red-600">Full name is required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile?.email || ""}
                disabled
              />
              <p className="text-xs text-gray-500">Email address cannot be changed. Contact support for assistance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={profile?.phone || ""} 
                onChange={handleChange}
                placeholder="+1234567890"
                className={profile?.missingFields?.includes('phone') ? 'border-red-300' : ''}
              />
              {profile?.missingFields?.includes('phone') && (
                <p className="text-xs text-red-600">Phone number is required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateofBirth">Date of Birth *</Label>
              <Input 
                id="dateofBirth" 
                name="dateofBirth" 
                type="date"
                value={profile?.dateofBirth || ""} 
                onChange={handleChange}
                className={profile?.missingFields?.includes('dateofBirth') ? 'border-red-300' : ''}
              />
              {profile?.missingFields?.includes('dateofBirth') && (
                <p className="text-xs text-red-600">Date of birth is required</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={profile?.username || ""}
              disabled
            />
            <p className="text-xs text-gray-500">Username cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pnadetails">PAN Details</Label>
            <Input 
              id="pnadetails" 
              name="pnadetails" 
              value={profile?.pnadetails || ""} 
              onChange={handleChange}
              placeholder="AAAAA9999A (Indian PAN format)"
            />
            <p className="text-xs text-gray-500">PAN card must follow Indian format: AAAAA9999A</p>
          </div>

          <div className="space-y-2">
            <Label>Account Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Provider</p>
                <p className="text-sm text-gray-600 capitalize">{profile?.provider}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Account Created</p>
                <p className="text-sm text-gray-600">{new Date(profile?.createdAt || '').toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                <p className="text-sm text-gray-600">{new Date(profile?.updatedAt || '').toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email Status</p>
                <Badge variant={profile?.emailVerified ? 'default' : 'secondary'}>
                  {profile?.emailVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-900 hover:bg-indigo-800">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
