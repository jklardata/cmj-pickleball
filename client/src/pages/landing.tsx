import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Clock, RefreshCw, Tablet } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Tablet className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CMJ Pickleball</h1>
                <p className="text-sm text-gray-500">Weekly Player Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-6">
              <Tablet className="text-white h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome to CMJ Pickleball</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our weekly pickleball games every Saturday at 2pm. Sign in below to manage your participation and stay connected with the community.
            </p>
          </div>

          {/* Game Schedule Info */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <CalendarCheck className="text-primary h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">Game Day</h3>
                <p className="text-sm text-gray-600">Saturdays at 2:00 PM</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mx-auto">
                  <Clock className="text-warning h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">Registration Closes</h3>
                <p className="text-sm text-gray-600">Fridays at 11:59 PM</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto">
                  <RefreshCw className="text-secondary h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">List Resets</h3>
                <p className="text-sm text-gray-600">Sundays at 12:00 AM</p>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900">Get Started</h3>
                    <p className="text-sm text-gray-600 mt-1">Sign in to manage your game participation</p>
                  </div>
                  
                  <Button 
                    onClick={() => window.location.href = '/api/login'}
                    className="w-full bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  >
                    Sign In with Replit
                  </Button>
                  
                  <div className="text-center text-sm text-gray-500">
                    New to CMJ Pickleball? Sign in to create your account automatically.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
