"use client";

import * as React from "react";
import { 
  KeyRound, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Building2, 
  MapPin, 
  Globe, 
  Edit3, 
  ShieldCheck, 
  LogOut 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppUser } from "@/types/types/auth.types";
import { FacilityType, UserRole } from "@/generated/prisma/browser";
import { PasswordChangeModal } from "@/components/custom/alerts/PasswordChangeModalComponent";
import Image from "next/image";


// Mock hook representation (Replace with your actual store implementation)
// const { user, logout, updatePasswordModalToggle } = useAuthStore();

export default function UserProfilePage({ user, onEditProfile,onPasswordChange, onLogout }: {
  user: AppUser;
  onEditProfile?: () => void;
  onPasswordChange?: () => void;
  onLogout?: () => void;
}) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(user.needsPasswordChange);  
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <p className="text-sm text-slate-500">Loading user profile...</p>
      </div>
    );
  }

  // Helper to compute user initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Role Badge Color Configuration
  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case UserRole.ADMIN:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case UserRole.PHARMACIST:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case UserRole.STAFF:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case UserRole.VIEWER:
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Facility Type Badge Styling
  const getFacilityTypeBadge = (type: FacilityType) => {
    if (type === FacilityType.SYSTEM_GLOBAL) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 gap-1 font-semibold">
          <Globe className="h-3 w-3" /> Enterprise Global Access
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-200 capitalize">
        {type.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/50 min-h-screen font-sans">
      
      {/* 2. High-Priority Password Change Alert Banner */}
      {user.needsPasswordChange && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">Security Action Required</h2>
              <p className="text-xs text-amber-700">
                Your account requires a mandatory password update before proceeding with standard clinical operations.
              </p>
            </div>
          </div>
          <Button 
            onClick={onPasswordChange}
            size="sm" 
            className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg shadow-xs shrink-0"
          >
            Update Password Now
          </Button>
        </div>
      )}

      {/* 3. Profile Header Component */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        <div className="h-28 bg-linear-to-r from-green-700 via-green-800 to-slate-900 px-6 pt-6 relative">
          <div className="absolute -bottom-8 left-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md bg-teal-900 text-white font-bold text-xl">
              <AvatarFallback className="bg-green-800 text-white text-xl">
                {/* {getInitials(user.fullName)} /img/system-user.png */}
                <Image src={user.imageUrl ? user.imageUrl : ""}  width={60} height={60} alt={getInitials(user.fullName)}/>
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-12 pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* User Metadata */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.fullName}</h1>
                
                {/* Active Status Badge */}
                {user.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  ID: {user.customId}
                </span>
                <span>•</span>
                <span className={cn("px-2.5 py-0.5 rounded-md text-[11px] font-semibold border", getRoleBadgeStyle(user.role))}>
                  {user.role.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Quick Action Group */}
            <div className="flex items-center gap-2.5">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEditProfile}
                className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg h-9"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Edit Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={()=> setIsPasswordModalOpen(!user.needsPasswordChange)}
                className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg h-9"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Change password
              </Button>
            </div>

            <PasswordChangeModal 
            isOpen={isPasswordModalOpen}
            userId={user.id}
            isMandatory={user.needsPasswordChange}
            onSuccess={() => {
                setIsPasswordModalOpen(false);
                // Optionally trigger a router refresh or update global store state
        }}
    />

          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 4. Personal Details Grid (2-Column structure inside span) */}
        <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Personal & Account Information</CardTitle>
            <CardDescription className="text-xs text-slate-500">Verified identity records and system metadata</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
              </span>
              <p className="text-sm font-semibold text-slate-800 break-all">{user.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Contact
              </span>
              {user.phone ? (
                <p className="text-sm font-semibold text-slate-800">{user.phone}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 italic">No contact added</span>
                  <button 
                    onClick={onEditProfile} 
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    + Add phone
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Account Created
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Last Login Session
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })
                  : "Never logged in"}
              </p>
            </div>

          </CardContent>
        </Card>

        {/* 5. Assigned Facility Section */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl flex flex-col justify-between">
          <div>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900">Current Workspace</CardTitle>
              <CardDescription className="text-xs text-slate-500">Assigned hospital ward or distribution facility</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {user.facility ? (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  user.facility.type === FacilityType.SYSTEM_GLOBAL 
                    ? "bg-amber-50/50 border-amber-200/80" 
                    : "bg-teal-50/30 border-teal-100"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        user.facility.type === FacilityType.SYSTEM_GLOBAL ? "bg-amber-500 text-white" : "bg-teal-700 text-white"
                      }`}>
                        {user.facility.type === FacilityType.SYSTEM_GLOBAL ? (
                          <Globe className="h-4 w-4" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">{user.facility.name}</h2>
                        <span className="text-[10px] font-mono text-slate-500">CODE: {user.facility.customId}</span>
                      </div>
                    </div>
                    {getFacilityTypeBadge(user.facility.type)}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.facility.location}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-2 text-center">
                  <div className="mx-auto w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-rose-900">Unassigned Account</h3>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    This profile is not currently mapped to any hospital ward or pharmacy depot. Please contact your administrator.
                  </p>
                </div>
              )}
            </CardContent>
          </div>

          {/* 6. Action Center Footer */}
          <CardContent className="pt-0 pb-6 border-t border-slate-100 mt-4">
            <div className="pt-4 space-y-2">
              <Button 
                variant="destructive" 
                onClick={onLogout}
                className="w-full text-xs font-semibold rounded-lg h-9 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" /> Log Out
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// Minimal utility class merger function if `cn` helper isn't globally imported in your setup
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}