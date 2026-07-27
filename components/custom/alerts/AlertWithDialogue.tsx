"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner" // Ensure you use your project's specific toast library

import React, { ReactNode, useState } from "react"

export interface AlertWithDiagProps {
    buttonText: string
    buttonVariant?: "default" | "outline" | "destructive" | "ghost" | "link" | "secondary"
    customVariant?: "primary" | "secondary" | "primary-outline" | "secondary-outline"
    title?: string
    message?: string
    cancelText?: string 
    confirmText: string
    btnClassName?: string
    button?: ReactNode
    icon?: React.ReactNode
    showInput?: boolean 
    inputPlaceholder?: string 
    cancelFunction?: () => void
    confirmFunction?: (reason?: string) => void 
}

export default function AlertWithDialogue({
    buttonText,
    title, 
    message,
    cancelText,
    confirmText, 
    cancelFunction, 
    confirmFunction, 
    buttonVariant,
    btnClassName,
    button,
    showInput = false, 
    inputPlaceholder = "Enter reason here...",
}: AlertWithDiagProps) {
  const [open, setOpen] = useState(false) // Controlled state to handle conditional closing
  const [reason, setReason] = useState("")

  const handleConfirm = (e: React.MouseEvent) => {
    if (showInput && !reason.trim()) {
      e.preventDefault() // Prevents the shadcn AlertDialogAction from closing the dialog [1, 2]
      toast.error("Please provide a reason")
      return
    }
    
    confirmFunction?.(reason)
    setReason("") // Reset state on success
    setOpen(false) // Close modal manually
  }

  const handleCancel = () => {
    cancelFunction?.()
    setReason("") // Reset state on cancel
    setOpen(false)
  }

  return (
    <div>
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {button ? button : <Button variant={buttonVariant} className={btnClassName}>{buttonText}</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
                    {message && <AlertDialogDescription>{message}</AlertDialogDescription>}
                </AlertDialogHeader>
                
                {showInput && (
                  <div className="my-4">
                    <Textarea 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={inputPlaceholder}
                      className="w-full min-h-20"
                    />
                  </div>
                )}

                <AlertDialogFooter>
                    {cancelText && (
                      <AlertDialogCancel  onClick={handleCancel}>
                        {cancelText}
                      </AlertDialogCancel>
                    )}
                    {/* Using asChild so our custom handleConfirm click logic controls the flow */}
                    <AlertDialogAction asChild>
                      <Button  onClick={handleConfirm}>
                        {confirmText}
                      </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog> 
    </div>
  )
}
