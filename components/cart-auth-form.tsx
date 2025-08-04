// components/cart-auth-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { authService } from "@/services/auth.service";
import { emailCheckService } from "@/services/email-check.service";
import { useToast } from "@/components/ui/use-toast";

interface CartAuthFormProps {
  onAuthSuccess: () => void;
  onPaymentTrigger: () => void;
  cartTotal: number;
  cartItemCount: number;
}

const CartAuthForm: React.FC<CartAuthFormProps> = ({ onAuthSuccess, onPaymentTrigger, cartTotal, cartItemCount }) => {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(isAuthenticated ? 1 : 0);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login } = useAuth();
  const { toast } = useToast();

  // Debug effect
  useEffect(() => {
    console.log('State changed - isSignupMode:', isSignupMode, 'email:', formData.email);
  }, [isSignupMode, formData.email]);

  const steps = ["Authentication", "Digio Verification", "Payment", "Missing Fields"];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (isSignupMode) {
        if (!formData.username.trim()) {
          newErrors.username = "Username is required";
        }
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      } else {
        if (!formData.username.trim()) {
          newErrors.username = "Email or username is required";
        }
        if (!formData.password) {
          newErrors.password = "Password is required";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      return await emailCheckService.checkEmailExists(email);
    } catch (error) {
      console.error('Error checking email:', error);
      // Fallback to login-based check
      try {
        return await emailCheckService.checkEmailExistsByLogin(email);
      } catch (fallbackError) {
        console.error('Fallback email check also failed:', fallbackError);
        return false;
      }
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep === 0) {
      setLoading(true);
      try {
        if (isSignupMode) {
          // Signup and login in one step
          await authService.signup({
            username: formData.username,
            email: formData.email,
            password: formData.password
          });
          await login(formData.username, formData.password, formData.rememberMe);
        } else {
          // Try login first
          try {
            await login(formData.username, formData.password, formData.rememberMe);
          } catch (loginError: any) {
            const isEmail = /\S+@\S+\.\S+/.test(formData.username);
            
            // If it's an email and login fails, switch to signup mode
            if (isEmail) {
              const email = formData.username;
              setFormData({ 
                username: "", 
                email: email, 
                password: "", 
                confirmPassword: "", 
                rememberMe: false 
              });
              setIsSignupMode(true);
              setErrors({});
              setLoading(false);
              
              toast({
                title: "Account not found",
                description: "We'll help you create a new account with this email.",
              });
              return;
            } else {
              throw loginError;
            }
          }
        }
        // Move to Digio verification after successful auth
        setCurrentStep(1);
      } catch (error: any) {
        setErrors({ general: error.message || "Authentication failed" });
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 1) {
      // Digio Verification - proceed to payment
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Payment - close modal and trigger payment
      onAuthSuccess();
      setTimeout(() => {
        onPaymentTrigger();
      }, 100);
    } else if (currentStep === 3) {
      // Missing Fields - complete
      onAuthSuccess();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleAuthMode = () => {
    setIsSignupMode(!isSignupMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (!isSignupMode) {
      // Switching to signup, preserve email if it's an email
      const preserveEmail = /\S+@\S+\.\S+/.test(formData.username);
      setFormData({
        username: "",
        email: preserveEmail ? formData.username : "",
        password: "",
        confirmPassword: "",
        rememberMe: false
      });
    } else {
      // Switching to login, clear all
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        rememberMe: false
      });
    }
    setErrors({});
  };

  const renderStepContent = () => {
    console.log('Rendering step:', currentStep, 'isSignupMode:', isSignupMode);
    switch (currentStep) {
      case 0: // Authentication (merged login/signup)
        if (isSignupMode) {
          return (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Creating account for:</span> {formData.email}
                </p>
              </div>
              <div>
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    className="pl-10 bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium">Email or Username</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your email or username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  We'll automatically detect if you need to sign up or sign in
                </p>
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
          );
        }
      case 1: // Digio Verification
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Digio Verification</h3>
            <p className="text-gray-600">Digio eSign integration will be added here</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Authentication Successful</span>
              </div>
              <p className="text-sm text-green-600 mt-1">Ready to proceed with your purchase</p>
            </div>
          </div>
        );
      case 2: // Payment
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Processing Payment</h3>
            <p className="text-gray-600">Completing your purchase...</p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{cartItemCount} item(s) in cart</span>
                <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      case 3: // Missing Fields
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Complete Your Profile</h3>
            <p className="text-gray-600">Please fill in the missing information to complete your profile</p>
          </div>
        );
      case 2: // Payment
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Processing Payment</h3>
            <p className="text-gray-600">Completing your purchase...</p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{cartItemCount} item(s) in cart</span>
                <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      case 3: // Complete Profile
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Complete Your Profile</h3>
            <p className="text-gray-600">Please fill in the missing information to complete your profile</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
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
          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentStep}-${isSignupMode}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error Display */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0 || loading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {currentStep === 0 && (isSignupMode ? "Create Account" : "Sign In")}
                  {currentStep === 1 && "Verify"}
                  {currentStep === 2 && "Pay Now"}
                  {currentStep === 3 && "Complete Profile"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Toggle Auth Mode */}
          {/* Toggle Auth Mode */}
          <div className="text-center pt-4 border-t">
            {currentStep === 0 && (
              <p className="text-sm text-gray-600">
                {!isSignupMode ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={toggleAuthMode}
                  className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  disabled={loading}
                >
                  {!isSignupMode ? "Sign up" : "Sign in"}
                </button>
              </p>
            )}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              <span>Your information is secure and encrypted</span>
            </div>
          </div>
      </div>
    </div>
  );
};

export default CartAuthForm;