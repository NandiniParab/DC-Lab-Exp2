"use client"

import { useState } from "react"
import { ChevronDown, Search, Headphones, Sun, Menu, X } from "lucide-react"

interface NavigationItem {
  title: string
  href: string
  isSubheading?: boolean
  parent?: string
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null)

  const navigationItems: NavigationSection[] = [
    {
      title: "About Us",
      items: [
        { title: "Our History", href: "#" },
        { title: "Chairman & Managing Trustee", href: "#" },
        { title: "Advisory Board", href: "#" },
        { title: "Board Members", href: "#" },
        { title: "Core Team", href: "#" },
        { title: "Founding Supporters", href: "#" },
        { title: "Young Change Makers", href: "#" },
      ],
    },
    {
      title: "Interventions",
      items: [
        { title: "SWIS Institute", href: "#", isSubheading: true },
        { title: "Centre for Social Impact & Innovation", href: "#", parent: "SWIS Institute" },
        { title: "Centre for Social Awareness & Action", href: "#", parent: "SWIS Institute" },
        { title: "Centre for Civil Administration & Engagement", href: "#", parent: "SWIS Institute" },
        { title: "SWIS Foundation", href: "#", isSubheading: true },
        { title: "Education", href: "#", parent: "SWIS Foundation" },
        { title: "Skill Development", href: "#", parent: "SWIS Foundation" },
        { title: "Nutrition", href: "#", parent: "SWIS Foundation" },
        { title: "Healthcare", href: "#", parent: "SWIS Foundation" },
        { title: "Relief of Poor", href: "#", parent: "SWIS Foundation" },
      ],
    },
    {
      title: "Get Involved",
      items: [
        { title: "Volunteering & Internships", href: "#" },
        { title: "Corporate Partners", href: "#" },
        { title: "Non - Profits", href: "#" },
      ],
    },
    {
      title: "Careers",
      items: [
        { title: "Search & Apply", href: "#" },
        { title: "Working at SWIS", href: "#" },
        { title: "Code of Conduct", href: "#" },
      ],
    },
    {
      title: "News & Media",
      items: [
        { title: "Press Releases", href: "#" },
        { title: "Media Coverage", href: "#" },
        { title: "Gallery", href: "#" },
      ],
    },
  ]

  const renderInterventionsDropdown = (items: NavigationItem[]) => {
    const swisInstitute = items.filter((item) => item.parent === "SWIS Institute" || item.title === "SWIS Institute")
    const swisFoundation = items.filter((item) => item.parent === "SWIS Foundation" || item.title === "SWIS Foundation")

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SWIS Institute Column */}
        <div>
          {swisInstitute.map((subItem, index) => {
            if (subItem.isSubheading) {
              return (
                <h3 key={index} className="font-bold text-lg mb-3 text-black border-b border-gray-300 pb-2">
                  {subItem.title}
                </h3>
              )
            } else {
              return (
                <a
                  key={index}
                  href={subItem.href}
                  className="block text-black hover:text-gray-600 transition-colors py-2 text-sm font-medium mb-1"
                >
                  {subItem.title}
                </a>
              )
            }
          })}
        </div>

        {/* SWIS Foundation Column */}
        <div>
          {swisFoundation.map((subItem, index) => {
            if (subItem.isSubheading) {
              return (
                <h3 key={index} className="font-bold text-lg mb-3 text-black border-b border-gray-300 pb-2">
                  {subItem.title}
                </h3>
              )
            } else {
              return (
                <a
                  key={index}
                  href={subItem.href}
                  className="block text-black hover:text-gray-600 transition-colors py-2 text-sm font-medium mb-1"
                >
                  {subItem.title}
                </a>
              )
            }
          })}
        </div>
      </div>
    )
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
    setActiveMobileSubmenu(null)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Top Info Bar */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12 text-sm">
              {/* Left side - Rankings */}
              <div className="flex items-center space-x-8 text-white/90">
                <div className="flex items-center space-x-2">
                  <span className="text-orange-400">IND Ranks 132</span>
                  <span>- Education</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-orange-400">IND Ranks 111</span>
                  <span>- Hunger</span>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-6 text-white/90">
                <button className="hover:text-white transition-colors">Impact Report</button>
                <button className="hover:text-white transition-colors">Donate Now</button>
                <button className="hover:text-white transition-colors">Contact Us</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/swis-logo.png" alt="SWIS Foundation" className="h-10 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-8">
              <a href="#" className="text-white hover:text-orange-400 transition-colors py-2 font-medium">
                Home
              </a>

              {navigationItems.map((item) => (
                <div key={item.title} className="relative group">
                  <button className="flex items-center space-x-1 text-white hover:text-orange-400 transition-colors py-2">
                    <span>{item.title}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {/* Desktop Dropdown Content (simplified for this component) */}
                  <div className="absolute hidden group-hover:block top-full left-0 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg z-40 min-w-[200px] p-4 rounded-md">
                    {item.title === "Interventions" ? (
                      renderInterventionsDropdown(item.items)
                    ) : (
                      <div className="space-y-2">
                        {item.items.map((subItem, index) => (
                          <a
                            key={index}
                            href={subItem.href}
                            className="block text-black hover:text-gray-600 transition-colors text-sm"
                          >
                            {subItem.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Add other direct links for desktop if any */}
              <a href="/JoinUs" className="text-white hover:text-orange-400 transition-colors py-2 font-medium">
                Join Us
              </a>
              <a href="#" className="text-white hover:text-orange-400 transition-colors py-2 font-medium">
                Contact Us
              </a>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-orange-400 transition-colors">
                <Headphones className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-orange-400 transition-colors">
                <Sun className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-orange-400 transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile menu button */}
              <button
                className="sm:hidden text-white hover:text-orange-400 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <img src="/swis-logo.png" alt="SWIS Foundation" className="h-8 w-auto" />
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-4">
                {/* Home Link for Mobile */}
                <div className="border-b border-gray-200 pb-4">
                  <a
                    href="#"
                    className="block font-semibold text-black transition-colors py-2"
                    onClick={handleLinkClick}
                  >
                    Home
                  </a>
                </div>

                {navigationItems.map((item) => (
                  <div key={item.title} className="border-b border-gray-200 pb-4">
                    <button
                      className="w-full flex items-center justify-between font-semibold text-black py-2"
                      onClick={() => setActiveMobileSubmenu(activeMobileSubmenu === item.title ? null : item.title)}
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${activeMobileSubmenu === item.title ? "rotate-180" : ""}`}
                      />
                    </button>
                    {activeMobileSubmenu === item.title && (
                      <div className="space-y-2 pl-4 pt-2">
                        {item.items.map((subItem, index) => {
                          if (subItem.isSubheading) {
                            return (
                              <h4 key={index} className="font-bold text-sm mt-4 mb-2 text-gray-700">
                                {subItem.title}
                              </h4>
                            )
                          } else {
                            return (
                              <a
                                key={index}
                                href={subItem.href}
                                className="block text-gray-600 hover:text-black transition-colors text-sm"
                                onClick={handleLinkClick}
                              >
                                {subItem.title}
                              </a>
                            )
                          }
                        })}
                      </div>
                    )}
                  </div>
                ))}
                {/* Direct Links for Mobile */}
                <div className="space-y-3 pt-4">
                  <a
                    href="/JoinUs"
                    onClick={handleLinkClick}
                    className="block font-semibold text-black transition-colors py-2"
                  >
                    Join Us
                  </a>
                  <a
                    href="#"
                    onClick={handleLinkClick}
                    className="block font-semibold text-black transition-colors py-2"
                  >
                    Contact Us
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
