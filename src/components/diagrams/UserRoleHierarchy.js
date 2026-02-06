'use client'

import React from 'react'
import { Users, Shield, Award, Briefcase, GitMerge } from 'lucide-react'

const UserRoleHierarchy = ({ isZoomed = false }) => {
  return (
    <div className={`w-full h-full flex items-center justify-center ${isZoomed ? 'p-12' : 'p-8'} bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50`}>
      <div className={`relative w-full ${isZoomed ? 'max-w-4xl' : 'max-w-2xl'}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* Main Content */}
        <div className="relative space-y-8">
          {/* Admin Level */}
          <div className="flex justify-center">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className={`relative bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl ${isZoomed ? 'p-8' : 'p-6'} shadow-2xl transform hover:scale-105 transition-all`}>
                <Shield className={`${isZoomed ? 'w-12 h-12' : 'w-8 h-8'} text-white mb-2 mx-auto`} />
                <div className="text-white text-center">
                  <div className={`${isZoomed ? 'text-lg' : 'text-sm'} font-semibold opacity-90`}>ADMIN</div>
                  <div className={`${isZoomed ? 'text-sm' : 'text-xs'} opacity-75 mt-1`}>Full System Access</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Line */}
          <div className="flex justify-center">
            <div className={`w-1 ${isZoomed ? 'h-16' : 'h-12'} bg-gradient-to-b from-red-400 to-blue-400`}></div>
          </div>

          {/* User Role System */}
          <div className="flex justify-center">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className={`relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl ${isZoomed ? 'p-8' : 'p-6'} shadow-2xl transform hover:scale-105 transition-all`}>
                <Users className={`${isZoomed ? 'w-12 h-12' : 'w-8 h-8'} text-white mb-2 mx-auto`} />
                <div className="text-white text-center">
                  <div className={`${isZoomed ? 'text-lg' : 'text-sm'} font-bold`}>USER ROLE SYSTEM</div>
                  <div className={`${isZoomed ? 'text-sm' : 'text-xs'} opacity-75 mt-1`}>Enhanced Permissions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Lines to 4 Roles */}
          <div className="flex justify-center">
            <div className={`flex ${isZoomed ? 'gap-6' : 'gap-4'}`}>
              <div className={`w-1 ${isZoomed ? 'h-16' : 'h-12'} bg-gradient-to-b from-blue-400 to-green-400`}></div>
              <div className={`w-1 ${isZoomed ? 'h-16' : 'h-12'} bg-gradient-to-b from-blue-400 to-purple-400`}></div>
              <div className={`w-1 ${isZoomed ? 'h-16' : 'h-12'} bg-gradient-to-b from-blue-400 to-amber-400`}></div>
              <div className={`w-1 ${isZoomed ? 'h-16' : 'h-12'} bg-gradient-to-b from-blue-400 to-cyan-400`}></div>
            </div>
          </div>

          {/* 4 User Role Types */}
          <div className={`grid grid-cols-2 md:grid-cols-4 ${isZoomed ? 'gap-6' : 'gap-4'}`}>
            {/* Team Head */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className={`relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl ${isZoomed ? 'p-6' : 'p-5'} shadow-xl transform hover:scale-105 transition-all`}>
                <Users className={`${isZoomed ? 'w-8 h-8' : 'w-7 h-7'} text-white mb-2 mx-auto`} />
                <div className="text-white text-center">
                  <div className={`${isZoomed ? 'text-sm' : 'text-xs'} font-bold whitespace-nowrap`}>Team Head</div>
                  <div className={`${isZoomed ? 'text-xs' : 'text-[10px]'} opacity-75 mt-1`}>Operators</div>
                </div>
              </div>
            </div>

            {/* QC Supervisor */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-xl blur opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className={`relative bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl ${isZoomed ? 'p-6' : 'p-5'} shadow-xl transform hover:scale-105 transition-all`}>
                <Award className={`${isZoomed ? 'w-8 h-8' : 'w-7 h-7'} text-white mb-2 mx-auto`} />
                <div className="text-white text-center">
                  <div className={`${isZoomed ? 'text-sm' : 'text-xs'} font-bold whitespace-nowrap`}>QC Supervisor</div>
                  <div className={`${isZoomed ? 'text-xs' : 'text-[10px]'} opacity-75 mt-1`}>Quality Control</div>
                </div>
              </div>
            </div>

            {/* Customer Relations */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className={`relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl ${isZoomed ? 'p-6' : 'p-5'} shadow-xl transform hover:scale-105 transition-all`}>
                <Briefcase className={`${isZoomed ? 'w-8 h-8' : 'w-7 h-7'} text-white mb-2 mx-auto`} />
                <div className="text-white text-center">
                  <div className={`${isZoomed ? 'text-sm' : 'text-xs'} font-bold leading-tight`}>Customer<br/>Relations</div>
                  <div className={`${isZoomed ? 'text-xs' : 'text-[10px]'} opacity-75 mt-1`}>Manager</div>
                </div>
              </div>
            </div>

            {/* Cross-functional */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className={`relative bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl ${isZoomed ? 'p-6' : 'p-5'} shadow-xl transform hover:scale-105 transition-all`}>
                <GitMerge className={`${isZoomed ? 'w-8 h-8' : 'w-7 h-7'} text-white mb-2 mx-auto`} />
                <div className="text-white text-center">
                  <div className={`${isZoomed ? 'text-sm' : 'text-xs'} font-bold leading-tight`}>Cross-<br/>functional</div>
                  <div className={`${isZoomed ? 'text-xs' : 'text-[10px]'} opacity-75 mt-1`}>Team Lead</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className={`${isZoomed ? 'mt-12' : 'mt-8'} text-center`}>
            <div className={`inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm ${isZoomed ? 'px-6 py-3' : 'px-4 py-2'} rounded-full shadow-lg`}>
              <div className={`${isZoomed ? 'w-3 h-3' : 'w-2 h-2'} rounded-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse`}></div>
              <span className={`${isZoomed ? 'text-base' : 'text-sm'} font-semibold text-gray-700`}>Enhanced Team Management</span>
            </div>
          </div>

          {/* Feature Pills */}
          <div className={`flex flex-wrap justify-center ${isZoomed ? 'gap-3' : 'gap-2'} mt-4`}>
            <div className={`bg-white/60 backdrop-blur-sm ${isZoomed ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'} rounded-full font-medium text-gray-700 shadow`}>
              👥 Team Assignment
            </div>
            <div className={`bg-white/60 backdrop-blur-sm ${isZoomed ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'} rounded-full font-medium text-gray-700 shadow`}>
              ✅ Task Approval
            </div>
            <div className={`bg-white/60 backdrop-blur-sm ${isZoomed ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'} rounded-full font-medium text-gray-700 shadow`}>
              📊 Performance Analytics
            </div>
            <div className={`bg-white/60 backdrop-blur-sm ${isZoomed ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'} rounded-full font-medium text-gray-700 shadow`}>
              🔐 Granular Permissions
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserRoleHierarchy
