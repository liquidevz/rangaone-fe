// components/cart-auth-form.tsx
"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { authService } from "@/services/auth.service";
import { useToast } from "@/components/ui/use-toast";

interface CartAuthFormProps {
  onAuthSuccess: () => void;
  cartTotal: number;
  cartItemCount: number;
}

const CartAuthForm: React.FC<CartAuthFormProps> = ({ onAuthSuccess, cartTotal, cartItemCount }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const steps = isLogin 
    ? ["Login", "Verify", "Complete"]
    : ["Sign Up", "Details", "Verify", "Complete"];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (isLogin) {
      if (currentStep === 0) {
        if (!formData.username.trim()) {
          newErrors.username = "Username or email is required";
        }
        if (!formData.password) {
          newErrors.password = "Password is required";
        }
      }
    } else {
      if (currentStep === 0) {
        if (!formData.username.trim()) {
          newErrors.username = "Username is required";
        }
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
      } else if (currentStep === 1) {
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (isLogin && currentStep === 0) {
      // Perform login
      setLoading(true);
      try {
        await login(formData.username, formData.password, formData.rememberMe);
        setCurrentStep(currentStep + 1);
        
        // Auto-complete after successful login
        setTimeout(() => {
          setCurrentStep(steps.length - 1);
          setTimeout(() => {
            onAuthSuccess();
          }, 500);
        }, 300);
      } catch (error: any) {
        setErrors({ general: error.message || "Login failed" });
      } finally {
        setLoading(false);
      }
    } else if (!isLogin && currentStep === steps.length - 2) {
      // Perform signup
      setLoading(true);
      try {
        await authService.signup({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        // After successful signup, login automatically
        await login(formData.username, formData.password, formData.rememberMe);
        setCurrentStep(currentStep + 1);
        
        setTimeout(() => {
          onAuthSuccess();
        }, 500);
      } catch (error: any) {
        setErrors({ general: error.message || "Signup failed" });
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setCurrentStep(0);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false
    });
    setErrors({});
  };

  const renderStepContent = () => {
    if (isLogin) {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium">Username or Email</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
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
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
              </div>
            </div>
          );
        case 1:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Logging you in...</h3>
              <p className="text-gray-600">Please wait while we verify your credentials</p>
            </div>
          );
        case 2:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Welcome back!</h3>
              <p className="text-gray-600">Redirecting to checkout...</p>
            </div>
          );
      }
    } else {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-4">
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
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
          );
        case 1:
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          );
        case 2:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Creating your account...</h3>
              <p className="text-gray-600">Please wait while we set up your account</p>
            </div>
          );
        case 3:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Account created successfully!</h3>
              <p className="text-gray-600">Redirecting to checkout...</p>
            </div>
          );
      }
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

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin && currentStep === 0 ? "Sign In" : 
                     !isLogin && currentStep === steps.length - 2 ? "Create Account" : "Next"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={onAuthSuccess}
                className="flex items-center gap-2"
              >
                Continue to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Toggle Auth Mode */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleAuthMode}
                className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
      </div>
    </div>
  );
};

export default CartAuthForm;